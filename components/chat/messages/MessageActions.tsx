// /**
//  * MessageActions Component
//  * 
//  * Provides message-specific actions:
//  * - Copy content
//  * - Regenerate response
//  * - Delete message
//  */

// "use client"

// import React from 'react'
// import { Button } from '@/components/ui/button'
// import { useChat } from '@/lib/hooks/chat/useChat'
// import type { ChatMessage } from '@/lib/types'

// interface MessageActionsProps {
//   message: ChatMessage
//   onCancel?: () => void
// }

// export function MessageActions({ message, onCancel }: MessageActionsProps) {
//   const { editMessage, deleteMessage, regenerateMessage } = useChat()

//   return (
//     <div className="flex items-center gap-2">
//       {message.userRole === 'user' && (
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => editMessage(message)}
//         >
//           <EditIcon className="h-4 w-4" />
//         </Button>
//       )}
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={() => deleteMessage(message.id)}
//       >
//         <TrashIcon className="h-4 w-4" />
//       </Button>
//       {message.assistantRole === 'assistant' && (
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => regenerateMessage(message.id)}
//         >
//           <RegenerateIcon className="h-4 w-4" />
//         </Button>
//       )}
//       {onCancel && (
//         <Button variant="ghost" size="icon" onClick={onCancel}>
//           <XIcon className="h-4 w-4" />
//         </Button>
//       )}
//     </div>
//   )
// }

// function EditIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
//     </svg>
//   )
// }

// function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M3 6h18" />
//       <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
//       <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
//     </svg>
//   )
// }

// function RegenerateIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
//       <path d="M21 3v5h-5" />
//       <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
//       <path d="M8 16H3v5" />
//     </svg>
//   )
// }

// function XIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M18 6L6 18" />
//       <path d="M6 6l12 12" />
//     </svg>
//   )
// }
