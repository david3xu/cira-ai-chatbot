export const MAX_RETRIES = 3;
export const INITIAL_BACKOFF = 1000; // 1 second
export const MAX_TOKENS = 2048;
export const DEFAULT_TEMPERATURE = 0.0;

export const DEFAULT_BASE_PROMPT = `Basic requirements:
1. Focus on answering the question.
2. Depending on the chat question, consider including chat history as input content.
3. Answer questions with good structure and logic.
`;
