import OpenAI from 'openai';

export const openai = new OpenAI({
  baseURL: process.env.NEXT_PUBLIC_OPENAI_URL,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  defaultQuery: {},
  dangerouslyAllowBrowser: true
});
