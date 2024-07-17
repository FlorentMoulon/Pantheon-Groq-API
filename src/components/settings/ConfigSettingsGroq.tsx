import styled from "styled-components";
import { Hint, SettingLabel, TextInput } from "../../styles/sharedStyles";
import { setOpenaiKey, setOpenaiOrgId, updateBaseModel, updateChatModel } from "../../redux/configSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";


const TextSettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 auto;
`;

const ConfigSettingsGroq = () => {
  const dispatch = useAppDispatch();
  const openAIKey = useAppSelector(state => state.config.apiConfigs[state.config.selectedApi].apiKey);
  const chatModel = useAppSelector(state => state.config.apiConfigs[state.config.selectedApi].chatModel);
  const baseModel = useAppSelector(state => state.config.apiConfigs[state.config.selectedApi].baseModel);

  return (
    <div>
      <h4>Groq API</h4>

      <TextSettingContainer>
        <SettingLabel>Groc API key</SettingLabel>
        <TextInput
          placeholder="..."
          value={openAIKey}
          onChange={(event) => dispatch(setOpenaiKey(event.target.value))}
        />
      </TextSettingContainer>
      <TextSettingContainer>
        <SettingLabel>Chat model</SettingLabel>
        <TextInput
          placeholder={chatModel}
          value={chatModel}
          onChange={(event) => dispatch(updateChatModel(event.target.value))}
        />
        <Hint>Used by daemons and 'Ask AI'</Hint>
      </TextSettingContainer>
      <TextSettingContainer>
        <SettingLabel>Base model</SettingLabel>
        <TextInput
          placeholder={baseModel}
          value={baseModel}
          onChange={(event) => dispatch(updateBaseModel(event.target.value))}
        />
        <Hint>Used by 'AI suggestions'</Hint>
      </TextSettingContainer>
    </div>
  )
}

export default ConfigSettingsGroq;