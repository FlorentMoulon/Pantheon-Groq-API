import { useEffect, useRef, useState } from 'react';
import { removeChatDaemon, updateChatDaemon } from "../../redux/daemonSlice"
import { ChatDaemonConfig } from '../../redux/models';
import styled from 'styled-components';
import { useAppDispatch } from '../../hooks';
import { Button, ButtonDangerous, ButtonSmall, ContainerHorizontal, Filler, InfoButton, SettingLabel, TextArea, TextButton, TextInput } from '../../styles/sharedStyles';
import ButtonWithConfirmation from '../common/ButtonWithConfirmation';
import { styledBackground } from '../../styles/mixins';
import { useModal } from '../ModalContext';
import ChainOfThoughtInfo from './ChainOfThoughtInfo';


const ChatDaemonSettingsContainer = styled.div`
  text-align: left;
`;

const StyledDiv = styled.div`
  padding: 8px;
  ${styledBackground};
`;

type ChatDaemonSettingsProps = {
  config: ChatDaemonConfig;
};

const ChatDaemonSettings: React.FC<ChatDaemonSettingsProps> = ({ config }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEnabled, setIsEnabled] = useState(config.enabled);
  const [isEdited, setIsEdited] = useState(false);
  const [name, setName] = useState(config.name) || '';
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt || '');
  const [userPrompts, setUserPrompts] = useState(config.userPrompts || []);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);
  const userPromptRefs = useRef<HTMLTextAreaElement[]>([]);
  const dispatch = useAppDispatch();
  const { addModal } = useModal();


  const handleUserPromptChange = (index: number, value: string, textArea: HTMLTextAreaElement) => {
    const newUserPrompts = [...userPrompts];
    newUserPrompts[index] = value;
    setUserPrompts(newUserPrompts);
    setIsEdited(true);
    resizeTextArea(textArea);
  }

  const addUserPrompt = () => {
    setUserPrompts([...userPrompts, '']);
    setIsEdited(true);
  }

  const deleteUserPrompt = (index: number) => {
    if (userPrompts.length > 1) {
      const updatedPrompts = [...userPrompts.slice(0, index), ...userPrompts.slice(index + 1)];
      setUserPrompts(updatedPrompts);
      setIsEdited(true);
    }
  };

  const resizeTextArea = (textArea: HTMLTextAreaElement | null) => {
    if (textArea) {
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (!isCollapsed) {
      resizeTextArea(systemPromptRef.current);
      userPromptRefs.current.forEach((ref) => resizeTextArea(ref));
    }
  }, [systemPrompt, userPrompts, isCollapsed]);

  const updateDaemonConfig = () => {
    try {
      const newConfig = {
        ...config,
        name: name,
        systemPrompt: systemPrompt,
        userPrompts: userPrompts,
        enabled: isEnabled,
      };
      dispatch(updateChatDaemon(newConfig));
      setIsEdited(false);
    } catch (error) {
      console.error("Failed to update config:", error);
      // TODO: Handle the error state appropriately, e.g., show an error message to the user
    }
  }

  // TODO Styling for the checkbox
  return (
    <ChatDaemonSettingsContainer>
      <span>
        <input type="checkbox" checked={isEnabled} onChange={(e) => { setIsEnabled(e.target.checked); setIsEdited(true); }} />
        <TextButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <span>{isCollapsed ? '▼' : '▲'} </span>
          {config.name}
        </TextButton>
        {isEdited && (
          <ButtonSmall onClick={updateDaemonConfig}>
            Save
          </ButtonSmall>
        )}
      </span>
      {!isCollapsed && (
        <StyledDiv>
          <label>
            <SettingLabel>Name</SettingLabel>
            <TextInput
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsEdited(true);
              }}
            />
          </label>
          <br />
          <label>
            <SettingLabel>System prompt</SettingLabel>
            <TextArea
              ref={systemPromptRef}
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                setIsEdited(true);
                resizeTextArea(e.target);
              }}
            />
          </label>
          <br />
          <ContainerHorizontal style={{ alignItems: 'center', justifyContent: 'center' }}>
            <h4 style={{ marginRight: '8px' }}>Chain-of-thought prompts</h4>
            <InfoButton onClick={() => addModal(<ChainOfThoughtInfo />)} />
            <Filler />
          </ContainerHorizontal>
          {userPrompts.map((prompt, index) => (
            <div key={index}>
              <label>
                <SettingLabel>Prompt {index + 1}</SettingLabel>
              </label>
              <TextArea
                ref={(el) => userPromptRefs.current[index] = el as HTMLTextAreaElement}
                value={prompt}
                onChange={(e) => handleUserPromptChange(index, e.target.value, e.target)}
                style={{ width: '100%' }}
              />
              <ButtonSmall
                onClick={() => deleteUserPrompt(index)}
                style={{ marginBottom: '10px' }}
              >
                Delete
              </ButtonSmall>
            </div>
          ))}
          <Button onClick={addUserPrompt}>
            Add User Prompt
          </Button>
          <ButtonWithConfirmation
            confirmationText="Are you sure you want to delete this daemon? This cannot be undone."
            onConfirm={() => dispatch(removeChatDaemon(config.id))}>
            <ButtonDangerous>Delete daemon</ButtonDangerous>
          </ButtonWithConfirmation>
        </StyledDiv>
      )}
    </ChatDaemonSettingsContainer>
  );
};

export default ChatDaemonSettings;