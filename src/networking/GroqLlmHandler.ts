import { dispatchError } from '../errorHandler';
import { ChainOfThoughtType } from '../redux/models';
import { BaseApiData, ChatApiData } from './networkingModels';
import { LlmHandler, roleToEnumMap } from './llmHandler';
import Groq from 'groq-sdk';


export class GroqLlmHandler extends LlmHandler {
  private async getGroqChatCompletion(data: ChatApiData, APIKey: string) {
    const groq = new Groq({ apiKey: APIKey });

    return groq.chat.completions.create({
      messages: data.messages.map((message) => ({ role: (message.role=="user")? "user" : "system", content: message.content })),
      model: data.model,
    });
  }

  private async getGroqChatCompletionBaseAPI(data: BaseApiData, APIKey: string) {
    const groq = new Groq({ apiKey: APIKey });

    return groq.chat.completions.create({
      messages: [{
        role: "user",
        content: data.prompt 
      }],
      model: data.model,
      temperature: data.temperature,
      max_tokens: data.max_tokens,
      stop: data.stop,
    });
  }


  private async CallChatAPI(data: ChatApiData, APIKey: string): Promise<string[] | null> {
    try {
      const response = await this.getGroqChatCompletion(data, APIKey);
      return response.choices.map((choice: { message: { content: string | null } }) => choice.message.content?.trim() || '');
    } catch (error: any) {
      dispatchError("Couldn't parse response from Groq Chat API");
      console.error(error);
      return null;
    }
  }

  private async CallBaseAPI(data: BaseApiData, APIKey: string): Promise<string[] | null> {
    try {
      const response = await this.getGroqChatCompletionBaseAPI(data, APIKey);
      return response.choices.map((choice: { message: { content: string | null } }) => choice.message.content?.trim() || '');
    } catch (error: any) {
      dispatchError("Couldn't parse response from Groq Chat API");
      console.error(error);
      return null;
    }
  }

  public async CallChatModel(systemPrompt: string, userPrompt: string, APIKey: string, orgId: string, chatModel: string): Promise<string[] | null> {
    const data: ChatApiData = {
      model: chatModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    };
    return await this.CallChatAPI(data, APIKey);
  }

  public async GenerateChatComment(systemPrompt: string, userPrompts: string[], APIKey: string, orgId: string, chatModel: string): Promise<{ text: string, chainOfThought: [ChainOfThoughtType, string][] } | null> {
    const data: ChatApiData = {
      model: chatModel,
      messages: [{ role: "system", content: systemPrompt }]
    };
    try {
      for (const userPrompt of userPrompts) {
        data.messages.push({ role: "user", content: userPrompt });
        const intermediateResponse = await this.CallChatAPI(data, APIKey);
        if (intermediateResponse) {
          data.messages.push({ role: "assistant", content: intermediateResponse[0] });
        } else {
          throw new Error("Didn't receive response from Groq Chat API", { cause: intermediateResponse });
        }
      }
      const commentText: string = data.messages[data.messages.length - 1].content;
      const chainOfThought: [ChainOfThoughtType, string][] = data.messages.map((message: { role: string; content: string }) => [roleToEnumMap[message.role], message.content]);
      return { text: commentText, chainOfThought: chainOfThought };
    } catch (error: any) {
      dispatchError("Couldn't finish daemon chain-of-thought");
      console.error(error);
      return null;
    }
  }

  public async GenerateBaseCompletions(prompt: string, APIKey: string, orgId: string, baseModel: string, temperature: number): Promise<string[] | null> {
    const data: BaseApiData = {
      model: baseModel,
      prompt: prompt.trim(),
      max_tokens: 64,
      temperature: temperature,
      stop: ["\n"],
      n: 6,
    };
    return await this.CallBaseAPI(data, APIKey);
  }

}