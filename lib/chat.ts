import { ProcessedDocument } from "@/lib/services/types";
import { createCompletion } from '@/actions/ai/services/completionService';
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { FormattedMessage } from '@/types/messages';
import { getCurrentModel } from '@/lib/modelUtils';
import { MessageContent } from "openai/resources/beta/threads/messages.mjs";
import { DocumentContent } from '@/types/messages';

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  dominationField: string;
  created_at: string;
  image?: string;
  chat_topic?: string;
  model?: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
  historyLoaded: boolean;
  dominationField: string;
  customPrompt?: string;
  codeBlocks?: string[];
  chat_topic?: string; // Add this line
  model?: string;
}

export interface ChatContextType {
  currentChat: Chat | null;
  streamingMessage: string;
  isLoading: boolean;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | null>>;
  isLoadingHistory: boolean;
  setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setStreamingMessage: React.Dispatch<React.SetStateAction<string>>;
  createNewChat: () => Chat;
  dominationField: string;
  setDominationField: (value: string) => void;
  savedCustomPrompt: string;
  setSavedCustomPrompt: (prompt: string) => void;
  addMessageToCurrentChat: (message: ChatMessage) => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  deleteChat: (id: string) => void;
  loadChatHistory: (chatId: string) => void;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  updateCurrentChat: (updater: (prevChat: Chat | null) => Chat | null) => void;
  customPrompt: string;
  setCustomPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (message: string) => void;
  chatId: string;
}

interface UpdatedChat {
  id: string;
  messages: ChatMessage[];
  historyLoaded: boolean;
  name?: string;
  dominationField: string;
  customPrompt?: string;
}


interface ChatMessageWithDocument {
  content: string;
  documentContext?: {
    text: string;
    fileName: string;
  } | null;
}

export async function handleSendChatMessage(
  message: string,
  document: ProcessedDocument | null
) {
  const messages: ChatCompletionMessageParam[] = [];
  
  if (document) {
    messages.push({
      role: 'system',
      content: getSystemContext(document)
    });
  }

  messages.push({
    role: 'user',
    content: message
  });

  return await createCompletion(
    messages as FormattedMessage[],
    getCurrentModel(),
    () => {} // Empty callback since we're not using streaming in this context
  );
}

function getSystemContext(document: ProcessedDocument): string {
  switch (document.contentType) {
    case 'image':
      return `The user is asking about an image file "${document.metadata.fileName}". 
              Please help analyze and describe the image content.`;
    case 'pdf':
      return `The user is asking about a PDF document "${document.metadata.fileName}" 
              with ${document.metadata.pageCount} pages. Here's the content: ${document.text}`;
    case 'markdown':
      return `The user is asking about a markdown file "${document.metadata.fileName}". 
              Here's the content: ${document.text}`;
    case 'doc':
      return `The user is asking about a document "${document.metadata.fileName}". 
              Here's the content: ${document.text}`;
    default:
      return `The user is asking about a text file "${document.metadata.fileName}". 
              Here's the content: ${document.text}`;
  }
}
