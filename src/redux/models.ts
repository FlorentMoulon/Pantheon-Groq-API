export interface Tree {
  id: number,
  sectionIds: number[];
}

export interface Section {
  id: number;
  treeId: number;
  parentSectionId: number | null;
  parentIdeaId: number | null;
  ideaIds: number[];
}

export interface Idea {
  id: number;
  isUser: boolean;
  sectionId: number;
  parentIdeaId: number | null;
  text: string;
  textTokens: string[];
  tokenSurprisals: number[];
}

export interface IdeaExport {
  text: string;
  incoming: boolean;
  outgoing: boolean;
}

export interface Comment {
  id: number;
  ideaId: number;
  text: string;
  daemonName: string;
  daemonType: string;
  userApproved: boolean;
}

export interface ChatDaemonConfig {
  id: number;
  name: string;
  description: string;
  rules: string;
  enabled: boolean;
}

export interface BaseDaemonConfig {
  mainTemplate: string;
  ideaTemplate: string;
  commentTemplate: string;
}

export interface InstructDaemonConfig {
  systemPrompt: string;
  contextTemplate: string;
}