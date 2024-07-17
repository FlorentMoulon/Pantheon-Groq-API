import { ApiType } from "../redux/configSlice";
import { ChainOfThoughtType } from "../redux/models";
import { GrocCallChatModel, GrocGenerateBaseCompletions, GrocGenerateChatComment } from "./GroqLlmHandler";
import { OpenAICallChatModel, OpenAIGenerateBaseCompletions, OpenAIGenerateChatComment } from "./OpenAILlmHandler";

export const roleToEnumMap: { [key: string]: ChainOfThoughtType } = {
  'system': ChainOfThoughtType.System,
  'user': ChainOfThoughtType.User,
  'assistant': ChainOfThoughtType.Daemon
};

export async function CallChatModel(systemPrompt: string, userPrompt: string, apiType:number, apiKey: string, orgId: string, chatModel: string): Promise<string[] | null> {
  if (apiType === ApiType.OpenAI) {
    return await OpenAICallChatModel(systemPrompt, userPrompt, apiKey, orgId, chatModel);
  }
  else {
    return await GrocCallChatModel(systemPrompt, userPrompt, apiKey, chatModel);
  }
}

export async function GenerateChatComment(systemPrompt: string, userPrompts: string[], apiType:number, apiKey: string, orgId: string, chatModel: string): Promise<{ text: string, chainOfThought: [ChainOfThoughtType, string][] } | null> {
  if (apiType === ApiType.OpenAI) {
    return await OpenAIGenerateChatComment(systemPrompt, userPrompts, apiKey, orgId, chatModel);
  }
  else {
    return await GrocGenerateChatComment(systemPrompt, userPrompts, apiKey, chatModel);
  }
}

export async function GenerateBaseCompletions(prompt: string, apiType:number, apiKey: string, orgId: string, baseModel: string, temperature: number): Promise<string[] | null> {
  if (apiType === ApiType.OpenAI) {
    return await OpenAIGenerateBaseCompletions(prompt, apiKey, orgId, baseModel, temperature);
  }
  else {
    return await GrocGenerateBaseCompletions(prompt, apiKey, baseModel, temperature);
  }
}