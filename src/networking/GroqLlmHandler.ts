import { dispatchError } from '../errorHandler';
import { ChainOfThoughtType } from '../redux/models';
import { roleToEnumMap } from './llmHandler';
import { BaseApiData, ChatApiData } from './networkingModels';
import Groq from 'groq-sdk';



async function getGroqChatCompletion(data: ChatApiData, APIKey: string) {
  const groq = new Groq({ apiKey: APIKey });

  return groq.chat.completions.create({
    messages: data.messages.map((message) => ({ role: (message.role=="user")? "user" : "system", content: message.content })),
    model: data.model,
  });
}

async function getGroqChatCompletionBaseAPI(data: BaseApiData, APIKey: string) {
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


async function CallChatAPI(data: ChatApiData, APIKey: string): Promise<string[] | null> {
  try {
    const response = await getGroqChatCompletion(data, APIKey);
    return response.choices.map((choice: { message: { content: string | null } }) => choice.message.content?.trim() || '');
  } catch (error: any) {
    dispatchError("Couldn't parse response from Groq Chat API");
    console.error(error);
    return null;
  }
}

async function CallBaseAPI(data: BaseApiData, APIKey: string): Promise<string[] | null> {
  try {
    const response = await getGroqChatCompletionBaseAPI(data, APIKey);
    return response.choices.map((choice: { message: { content: string | null } }) => choice.message.content?.trim() || '');
  } catch (error: any) {
    dispatchError("Couldn't parse response from Groq Chat API");
    console.error(error);
    return null;
  }
}

export async function GrocCallChatModel(systemPrompt: string, userPrompt: string, APIKey: string, orgId: string, chatModel: string): Promise<string[] | null> {
  const data: ChatApiData = {
    model: chatModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  };
  return await CallChatAPI(data, APIKey);
}

export async function GrocGenerateChatComment(systemPrompt: string, userPrompts: string[], APIKey: string, orgId: string, chatModel: string): Promise<{ text: string, chainOfThought: [ChainOfThoughtType, string][] } | null> {
  const data: ChatApiData = {
    model: chatModel,
    messages: [{ role: "system", content: systemPrompt }]
  };
  try {
    for (const userPrompt of userPrompts) {
      data.messages.push({ role: "user", content: userPrompt });
      const intermediateResponse = await CallChatAPI(data, APIKey);
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

export async function GrocGenerateBaseCompletions(prompt: string, APIKey: string, orgId: string, baseModel: string, temperature: number): Promise<string[] | null> {
  const data: BaseApiData = {
    model: baseModel,
    prompt: prompt.trim(),
    max_tokens: 64,
    temperature: temperature,
    stop: ["\n"],
    n: 6,
  };
  return await CallBaseAPI(data, APIKey);
}