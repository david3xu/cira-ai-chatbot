// import { useRouter, useParams } from 'next/navigation'
// import { useChat } from './chat/useChat'

// export function useChatRouting() {
//   const router = useRouter()
//   const params = useParams()
//   const { currentChat, setCurrentChat } = useChat()

//   React.useEffect(() => {
//     if (params.id && (!currentChat || currentChat.id !== params.id)) {
//       // Load chat by ID
//       setCurrentChat(params.id)
//     }
//   }, [params.id, currentChat, setCurrentChat])

//   const navigateToChat = (chatId: string) => {
//     router.push(`/chat/${chatId}`)
//   }

//   return {
//     navigateToChat,
//     currentChatId: params.id as string | undefined
//   }
// } 