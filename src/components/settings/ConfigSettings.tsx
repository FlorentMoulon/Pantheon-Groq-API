import styled from "styled-components";
import { SettingLabel } from "../../styles/sharedStyles";
import { setSelectedApi, ApiType } from "../../redux/configSlice";
import { useAppDispatch, useAppSelector } from "../../hooks";
import ConfigSettingsGroq from "./ConfigSettingsGroq";
import ConfigSettingsOpenAI from "./ConfigSettingsOpenAI";

const TextSettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0 auto;
`;

const ConfigSettings = () => {
  const dispatch = useAppDispatch();
  const apiType = useAppSelector(state => state.config.selectedApi);

  return (
    <div>
      <TextSettingContainer>
        <SettingLabel>API </SettingLabel>
        <label>
          <input
            type="radio"
            name="api"
            value="Use OpenAI API"
            checked={apiType === ApiType.OpenAI}
            onChange={() => dispatch(setSelectedApi(ApiType.OpenAI))}
          />
          Use OpenAI API
        </label>
        <label>
          <input
            type="radio"
            name="api"
            value="Use Groq API"
            checked={apiType === ApiType.Groq}
            onChange={() => dispatch(setSelectedApi(ApiType.Groq))}
          />
          Use Groq API
        </label>
      </TextSettingContainer>

      {apiType === ApiType.OpenAI ? (
        <ConfigSettingsOpenAI />
      ) : (
        <ConfigSettingsGroq />
      )}
    </div>
  )
}

export default ConfigSettings;