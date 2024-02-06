import InputBox from './InputBox';
import HistoryContainer from './HistoryContainer';
import TopBar from '../../TopBar';
import CompletionsContainer from './CompletionsContainer';
import ErrorDisplay from '../../../errorHandler';
// import WelcomeMessage from './WelcomeMessage';
import { ContainerVertical } from '../../../styles/sharedStyles';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { useEffect, useState } from 'react';
import { openTree } from '../../../redux/thunks';


const TreeView = () => {
  const { treeId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const trees = useAppSelector(state => state.tree.trees);
  const mostRecentTreeId = useAppSelector(state => state.ui.activeTreeId);
  const [treeFound, setTreeFound] = useState(false);

  useEffect(() => {
    const requestedTreeExists = treeId && trees[parseInt(treeId)]
    const shouldOpenMostRecentTree = !treeId && trees[mostRecentTreeId]
    if (requestedTreeExists) {
      dispatch(openTree(parseInt(treeId)));
      setTreeFound(true);
    } else if (shouldOpenMostRecentTree) {
      dispatch(openTree(mostRecentTreeId));
      setTreeFound(true);
    } else {
      navigate('/collection');
      setTreeFound(false);
    }
  }, [treeId, dispatch, navigate, trees, mostRecentTreeId]);

  // TODO Make WelcomeMesage show up only on first time opening the app
  return (
    <ContainerVertical>
      {treeFound &&
        <>
          <TopBar />
          <HistoryContainer />
          <InputBox />
          <CompletionsContainer />
          <ErrorDisplay />
          {/* <WelcomeMessage /> */}
        </>
      }
    </ContainerVertical>
  );
}

export default TreeView;