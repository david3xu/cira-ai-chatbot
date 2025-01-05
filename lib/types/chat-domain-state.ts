import { Chat } from "@/components/providers/chat";
import { ChatMessage } from "@/components/providers/chat";
import { ModelConfig, OllamaModel } from "@/lib/types";

export interface ChatDomainState {
  selectedModel: string;
  temperature: number;
  maxTokens: number;
  customPrompt: string | null;
  dominationField: string;
  chats: Chat[];
  currentChat: Chat | null;
  currentMessage: ChatMessage | null;
  messages: ChatMessage[];
  searchResults: Chat[];
  searchQuery: string | null;
  filteredChats: Chat[] | null;
  models: OllamaModel[];
  modelConfig: ModelConfig | null;
}

export const initialChatDomainState: ChatDomainState = {
  selectedModel: '',
  temperature: 0.7,
  maxTokens: 2048,
  customPrompt: null,
  dominationField: '',
  chats: [],
  currentChat: null,
  currentMessage: null,
  messages: [],
  searchResults: [],
  searchQuery: null,
  filteredChats: null,
  models: [],
  modelConfig: null
};

export type ChatDomainAction = 
  | { type: 'SET_DOMINATION_FIELD'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_TEMPERATURE'; payload: number }
  | { type: 'SET_MAX_TOKENS'; payload: number }
  | { type: 'SET_CUSTOM_PROMPT'; payload: string | null }
  | { type: 'SYNC_WITH_CHAT_STATE'; payload: {
      dominationField?: string;
      model?: string;
      customPrompt?: string | null;
    }};

export interface ChatDomainContextValue {
  state: ChatDomainState;
  dispatch: React.Dispatch<ChatDomainAction>;
  actions: {
    setModel: (model: string) => void;
    setTemperature: (temp: number) => void;
    setMaxTokens: (tokens: number) => void;
    setCustomPrompt: (prompt: string | null) => void;
    setDominationField: (field: string) => void;
  };
  isCustomModel: boolean;
  hasCustomPrompt: boolean;
  modelConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
}