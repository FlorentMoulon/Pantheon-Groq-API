import axios from 'axios';
import { dispatchError } from '../errorHandler';
import { ChainOfThoughtType } from '../redux/models';
import { AxiosConfig, AxiosData, BaseApiData, ChatApiData } from './networkingModels';
import { LlmHandler, roleToEnumMap } from './_LlmHandler';


export class OpenAILlmHandler extends LlmHandler {

  private async CallOpenAIAPI(url: string, data: AxiosData, APIKey: string, orgId: string) {
    const config: AxiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIKey}`,
        'OpenAI-Organization': orgId
      }
    };
    try {
      return await axios.post(url, data, config);
    } catch (error: any) {
      dispatchError("Error calling OpenAI API");
      console.error(error);
    }
  }

  private async CallChatAPI(data: ChatApiData, APIKey: string, orgId: string): Promise<string[] | null> {
    const response = await this.CallOpenAIAPI('https://api.openai.com/v1/chat/completions', data, APIKey, orgId);
    if (response) {
      try {
        return response.data.choices.map((choice: { message: { content: string } }) => choice.message.content.trim());
      } catch (error: any) {
        dispatchError("Couldn't parse response from OpenAI Chat API");
        console.error(error);
        return null;
      }
    } else {
      return null;
    }
  }

  private async CallBaseAPI(data: BaseApiData, APIKey: string, orgId: string): Promise<string[] | null> {
    const response = await this.CallOpenAIAPI('https://api.openai.com/v1/completions', data, APIKey, orgId);
    if (response) {
      try {
        return response.data.choices.map((choice: { text: string }) => choice.text.trim());
      } catch (error: any) {
        dispatchError("Couldn't parse response from OpenAI Base API");
        console.error(error);
        return null;
      }
    } else {
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
    return await this.CallChatAPI(data, APIKey, orgId);
  }

  public async GenerateChatComment(systemPrompt: string, userPrompts: string[], APIKey: string, orgId: string, chatModel: string): Promise<{ text: string, chainOfThought: [ChainOfThoughtType, string][] } | null> {
    const data: ChatApiData = {
      model: chatModel,
      messages: [{ role: "system", content: systemPrompt }]
    };
    try {
      for (const userPrompt of userPrompts) {
        data.messages.push({ role: "user", content: userPrompt });
        const intermediateResponse = await this.CallChatAPI(data, APIKey, orgId);
        if (intermediateResponse) {
          data.messages.push({ role: "assistant", content: intermediateResponse[0] });
        } else {
          throw new Error("Didn't receive response from OpenAI Chat API", { cause: intermediateResponse });
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
    return await this.CallBaseAPI(data, APIKey, orgId);
  }
}