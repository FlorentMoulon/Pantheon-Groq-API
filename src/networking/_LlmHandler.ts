
import { ChainOfThoughtType } from '../redux/models';

export const roleToEnumMap: { [key: string]: ChainOfThoughtType } = {
  'system': ChainOfThoughtType.System,
  'user': ChainOfThoughtType.User,
  'assistant': ChainOfThoughtType.Daemon
};

export class LlmHandler{
  public async CallChatModel(systemPrompt: string, userPrompt: string, APIKey: string, orgId: string, chatModel: string): Promise<string[] | null> {
    return null;
  }

  public async GenerateChatComment(systemPrompt: string, userPrompts: string[], APIKey: string, orgId: string, chatModel: string): Promise<{ text: string, chainOfThought: [ChainOfThoughtType, string][] } | null>{
    return null;
  }

  public async GenerateBaseCompletions(prompt: string, APIKey: string, orgId: string, baseModel: string, temperature: number): Promise<string[] | null> {
    return null;
  }
}