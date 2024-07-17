import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum Theme {
  System = 'system',
  Light = 'light',
  Dark = 'dark'
}

export enum ApiType {
  OpenAI = 0,
  Groq = 1
}

export interface ApiConfig {
  name: string;
  apiKey: string;
  orgId: string;
  baseModel: string;
  chatModel: string;
}

export interface ConfigState {
  selectedApi: number;
  apiConfigs: ApiConfig[];
  isSynchronizerActive: boolean; // TODO Remove this field
  theme?: Theme;
}

const initialState: ConfigState = {
  selectedApi: 0,
  apiConfigs: [
    {
      name: 'OpenAI',
      apiKey: '',
      orgId: '',
      baseModel: 'davinci-002',
      chatModel: 'gpt-4o'
    },
    {
      name: 'Groq',
      apiKey: '',
      orgId: '',
      baseModel: 'llama3-8b-8192',
      chatModel: 'llama3-8b-8192'
    }
  ],
  isSynchronizerActive: false,
  theme: Theme.System
};

const configSlice = createSlice({
  name: 'config',
  initialState: initialState,
  reducers: {
    setSelectedApi(state, action: PayloadAction<number>) {
      state.selectedApi = action.payload;
    },
    setOpenaiKey(state, action: PayloadAction<string>) {
      state.apiConfigs[state.selectedApi].apiKey = action.payload;
    },
    setOpenaiOrgId(state, action: PayloadAction<string>) {
      state.apiConfigs[state.selectedApi].orgId = action.payload
    },
    updateBaseModel(state, action: PayloadAction<string>) {
      state.apiConfigs[state.selectedApi].baseModel = action.payload;
    },
    updateChatModel(state, action: PayloadAction<string>) {
      state.apiConfigs[state.selectedApi].chatModel = action.payload;
    },
    setSynchronizerActive(state, action: PayloadAction<boolean>) {
      state.isSynchronizerActive = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    replaceSlice: (_, action: PayloadAction<ConfigState>) => action.payload,
    resetSlice: (_) => initialState
  },
});

export const { updateBaseModel, updateChatModel, setOpenaiKey, setSelectedApi, setOpenaiOrgId, setSynchronizerActive, setTheme, replaceSlice: replaceConfigSlice, resetSlice: resetConfigSlice } = configSlice.actions;
export const initialConfigState = initialState;
export default configSlice.reducer;