import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  messages: Message[]
}

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  createChat: (initialMessage: string) => Promise<string>
  addMessage: (chatId: string, message: Message) => Promise<void>
  getMessages: (chatId: string) => Message[]
}

export const useChat = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,

      createChat: async (initialMessage: string) => {
        const newChatId = Date.now().toString()
        set(state => ({
          chats: [...state.chats, { id: newChatId, messages: [] }],
          currentChatId: newChatId,
        }))
        return newChatId
      },

      addMessage: async (chatId: string, message: Message) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, message] }
              : chat
          ),
          isLoading: message.role === 'user', // Set loading when user sends message
        }))

        if (message.role === 'user') {
          // Simulate AI response
          setTimeout(async () => {
            const aiMessage: Message = {
              role: 'assistant',
              content: 'This is a sample AI response.',
            }
            
            set(state => ({
              chats: state.chats.map(chat =>
                chat.id === chatId
                  ? { ...chat, messages: [...chat.messages, aiMessage] }
                  : chat
              ),
              isLoading: false,
            }))
          }, 1000)
        }
      },

      getMessages: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId)
        return chat?.messages || []
      },
    }),
    {
      name: 'chat-storage', // Name for localStorage
    }
  )
) 