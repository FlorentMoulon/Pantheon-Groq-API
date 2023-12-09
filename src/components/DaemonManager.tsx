import BaseDaemon from '../daemons/BaseDaemon';
import { useEffect, useMemo, useState } from 'react';
import { selectRecentIdeasWithoutComments, selectIdeasUpToMaxCommented, addComment, Idea, Comment, selectCommentsGroupedByIdeaIds } from '../redux/textSlice';
import ChatDaemon from '../daemons/ChatDaemon';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectEnabledChatDaemons, selectBaseDaemon} from '../redux/daemonSlice';

const DaemonManager = () => {
  const dispatch = useAppDispatch();
  const lastTimeActive = useAppSelector(state => state.text.lastTimeActive);
  const [hasBeenInactive, setHasBeenInactive] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const chatDaemonConfigs = useAppSelector(selectEnabledChatDaemons);
  const baseDaemonConfig = useAppSelector(selectBaseDaemon);
  const [chatDaemons, setChatDaemons] = useState<ChatDaemon[]>([]);
  const [baseDaemon, setBaseDaemon] = useState<BaseDaemon | null>(null);
  const currentIdeas = useAppSelector(selectRecentIdeasWithoutComments);
  const pastIdeas = useAppSelector(selectIdeasUpToMaxCommented);
  const pastIdeaIds = useMemo(() => pastIdeas.map(idea => idea.id), [pastIdeas]);
  const commentsForPastIdeas = useAppSelector(state => selectCommentsGroupedByIdeaIds(state, pastIdeaIds, 'chat'));

  const openAIKey = useAppSelector(state => state.llm.openAIKey);
  const openAIOrgId = useAppSelector(state => state.llm.openAIOrgId);
  const chatModel = useAppSelector(state => state.llm.chatModel);
  const baseModel = useAppSelector(state => state.llm.baseModel);

  useEffect(() => {
    const daemon = baseDaemonConfig ? new BaseDaemon(baseDaemonConfig) : null;
    setBaseDaemon(daemon);
  }, [baseDaemonConfig]);

  useEffect(() => {
    const daemons = chatDaemonConfigs.map(config => new ChatDaemon(config));
    setChatDaemons(daemons);
  }, [chatDaemonConfigs]);

  useEffect(() => {
    const dispatchChatComment = async (pastIdeas: Idea[], currentIdeas: Idea[], daemon: ChatDaemon) => {
      try {
        const results = await daemon.generateComment(pastIdeas, currentIdeas, openAIKey, openAIOrgId, chatModel);
        dispatch(addComment({ ideaId: results[0].id, text: results[0].content, daemonName: daemon.config.name, daemonType: "chat" }));
      } catch (error) {
        console.error('Failed to dispatch chat comment:', error);
      } finally {
        setIsCommenting(false);
      }
    }
  
    const dispatchBaseComment = async (pastIdeas: Idea[], currentIdeas: Idea[], commentsForPastIdeas: Record<number, Comment[]>, daemon: BaseDaemon) => {
      try {
        const result = await daemon.generateComment(pastIdeas, currentIdeas, commentsForPastIdeas, openAIKey, openAIOrgId, baseModel);
        if (result) {
          dispatch(addComment({ ideaId: result.id, text: result.content, daemonName: result.daemonName, daemonType: "base" }));
        }
      } catch (error) {
        console.error('Failed to dispatch base comment:', error);
      } finally {
        setIsCommenting(false);
      }
    }

    const interval = setInterval(() => {
      const secondsSinceLastActive = (new Date().getTime() - new Date(lastTimeActive).getTime()) / 1000;
      if (secondsSinceLastActive > 5 && !hasBeenInactive && !isCommenting) {
        console.log('User inactive');
        setHasBeenInactive(true);

        // Make new comments
        if (currentIdeas.length > 0 && openAIKey && openAIOrgId) {
          setIsCommenting(true);

          // Chat Daemons
          const randomDaemon = chatDaemons[Math.floor(Math.random() * chatDaemons.length)];
          dispatchChatComment(pastIdeas, currentIdeas, randomDaemon);

          // Base Daemons
          if(baseDaemon) {
            const hasComments = Object.values(commentsForPastIdeas).some(commentsArray => commentsArray.length > 0);
            if (hasComments) {
              dispatchBaseComment(pastIdeas, currentIdeas, commentsForPastIdeas, baseDaemon);
            }
          }
        }
      }

      if (secondsSinceLastActive < 5 && hasBeenInactive) {
        console.log('User active');
        setHasBeenInactive(false);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [lastTimeActive, 
      hasBeenInactive, 
      currentIdeas, 
      chatDaemons,
      baseDaemon,
      pastIdeas,
      commentsForPastIdeas,
      isCommenting,
      openAIKey,
      openAIOrgId,
      chatModel,
      baseModel,
      dispatch]);

  return null;
}

export default DaemonManager;