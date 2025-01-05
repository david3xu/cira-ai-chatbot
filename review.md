8. API Structure (/app/api)
/* API Architecture Notes */

/chat
  /* Chat-related endpoints */
  /messages
    - POST /chat/messages: Create new message
    - PUT /chat/messages/[id]: Update message
    - DELETE /chat/messages/[id]: Delete message
    - GET /chat/messages: Get message history
    
  /conversations
    - GET /chat/conversations: List conversations
    - POST /chat/conversations: Create conversation
    - DELETE /chat/conversations/[id]: Delete conversation
    - PUT /chat/conversations/[id]: Update conversation metadata

/ai
  /* AI model endpoints */
  /completion
    - POST /ai/completion: Get AI completion
    - POST /ai/completion/stream: Stream AI response
    
  /models
    - GET /ai/models: List available models
    - POST /ai/models/switch: Switch active model
    
  /context
    - POST /ai/context: Update conversation context
    - GET /ai/context/[conversationId]: Get conversation context

/documents
  /* Document processing endpoints */
  - POST /documents/upload: Upload document
  - GET /documents: List documents
  - GET /documents/[id]: Get document metadata
  - DELETE /documents/[id]: Delete document
  - POST /documents/process: Process document content
  - GET /documents/[id]/content: Get processed content

/auth
  /* Authentication endpoints */
  - POST /auth/login: User login
  - POST /auth/logout: User logout
  - POST /auth/refresh: Refresh token
  - GET /auth/session: Get session info

Component Functions Breakdown:

/providers
  ChatProvider.tsx:
    - useChatProvider() // Hook for accessing chat context
    - ChatProvider({ children }) // Main provider component
    - handleNewMessage(message)
    - handleMessageUpdate(id, content)
    - handleMessageDelete(id)

  DocumentProvider.tsx:
    - useDocumentProvider() // Hook for document context
    - DocumentProvider({ children })
    - handleDocumentUpload(file)
    - handleDocumentProcess(id)
    - handleDocumentDelete(id)

  ThemeProvider.tsx:
    - useTheme() // Hook for theme context
    - ThemeProvider({ children })
    - toggleTheme()
    - setTheme(theme)

/ui
  Button.tsx:
    - Button({ variant, size, children, ...props })
    - IconButton({ icon, ...props })
    - ButtonGroup({ children })

  Input.tsx:
    - Input({ type, value, onChange, ...props })
    - TextArea({ value, onChange, ...props })
    - SearchInput({ onSearch, ...props })

/chat
  /conversation
    ChatContainer.tsx:
      - ChatContainer({ conversationId })
      - useChatScroll() // Custom scroll management
      - handleStreamingResponse()

    ChatHeader.tsx:
      - ChatHeader({ title, status })
      - ChatOptions({ onSelect })
      - ChatBreadcrumb({ path })

    ChatBody.tsx:
      - ChatBody({ messages })
      - useMessageObserver() // Intersection observer for loading
      - handleLoadMore()

  /messages
    MessageList.tsx:
      - MessageList({ messages })
      - useVirtualization() // Virtual scroll hook
      - handleMessageVisibility()

    MessageItem.tsx:
      - MessageItem({ message })
      - MessageContent({ content })
      - MessageMetadata({ metadata })
      - CodeBlock({ code, language })
      - ImageMessage({ src, alt })

    MessageActions.tsx:
      - MessageActions({ messageId })
      - handleEdit()
      - handleDelete()
      - handleCopy()

  /input
    ChatInput.tsx:
      - ChatInput({ onSubmit })
      - useAutoResize() // Textarea auto-resize
      - handleKeyPress()
      - handlePaste()

    InputActions.tsx:
      - InputActions({ onAction })
      - AttachmentButton({ onSelect })
      - EmojiPicker({ onSelect })
      - SendButton({ onClick })

    AttachmentButton.tsx:
      - AttachmentButton({ onFileSelect })
      - handleFileChange()
      - validateFile()

  /sidebar
    ChatHistory.tsx:
      - ChatHistory({ conversations })
      - useHistoryFilter() // Filter/search hook
      - handleConversationSelect()

    ChatFilter.tsx:
      - ChatFilter({ onFilter })
      - useDebounce() // Debounced search
      - handleSearchChange()

    HistoryItem.tsx:
      - HistoryItem({ conversation })
      - ConversationPreview({ content })
      - TimeStamp({ date })

/document
  /uploader
    FileUpload.tsx:
      - FileUpload({ onUpload })
      - useDragDrop() // Drag and drop hook
      - handleFileDrop()
      - validateFileType()

    UploadProgress.tsx:
      - UploadProgress({ progress })
      - ProgressBar({ percent })
      - UploadStatus({ status })

    FileList.tsx:
      - FileList({ files })
      - FileItem({ file })
      - RemoveButton({ onClick })

  /viewer
    DocumentViewer.tsx:
      - DocumentViewer({ documentId })
      - useDocumentRenderer() // Document rendering hook
      - handleZoom()
      - handlePageChange()

    DocumentToolbar.tsx:
      - DocumentToolbar({ onAction })
      - ZoomControls({ onZoom })
      - PageControls({ onPageChange })
      - DownloadButton({ onClick })

    PageNavigation.tsx:
      - PageNavigation({ totalPages })
      - PageSelector({ onSelect })
      - NavigationArrows({ onNext, onPrev })





App Structure
│
├── /app/api/
│   ├── /chat
│   │   ├── /messages
│   │   │   ├── POST /chat/messages
│   │   │   ├── PUT /chat/messages/[id]
│   │   │   ├── DELETE /chat/messages/[id]
│   │   │   └── GET /chat/messages
│   │   │
│   │   └── /conversations
│   │       ├── GET /chat/conversations
│   │       ├── POST /chat/conversations
│   │       ├── DELETE /conversations/[id]
│   │       └── PUT /conversations/[id]
│   │
│   ├── /ai
│   │   ├── /completion
│   │   │   ├── POST /ai/completion
│   │   │   └── POST /ai/completion/stream
│   │   │
│   │   ├── /models
│   │   │   ├── GET /ai/models
│   │   │   └── POST /ai/models/switch
│   │   │
│   │   └── /context
│   │       ├── POST /ai/context
│   │       └── GET /ai/context/[conversationId]
│   │
│   ├── /documents
│   │   ├── POST /documents/upload
│   │   ├── GET /documents
│   │   ├── GET /documents/[id]
│   │   ├── DELETE /documents/[id]
│   │   ├── POST /documents/process
│   │   └── GET /documents/[id]/content
│   │
│   └── /auth
│       ├── POST /auth/login
│       ├── POST /auth/logout
│       ├── POST /auth/refresh
│       └── GET /auth/session
│
├── /providers
│   ├── ChatProvider.tsx
│   ├── DocumentProvider.tsx
│   └── ThemeProvider.tsx
│
├── /ui
│   ├── Button.tsx
│   └── Input.tsx
│
├── /chat
│   ├── /conversation
│   │   ├── ChatContainer.tsx
│   │   ├── ChatHeader.tsx
│   │   └── ChatBody.tsx
│   │
│   ├── /messages
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   └── MessageActions.tsx
│   │
│   ├── /input
│   │   ├── ChatInput.tsx
│   │   ├── InputActions.tsx
│   │   └── AttachmentButton.tsx
│   │
│   └── /sidebar
│       ├── ChatHistory.tsx
│       ├── ChatFilter.tsx
│       └── HistoryItem.tsx
│
└── /document
    ├── /uploader
    │   ├── FileUpload.tsx
    │   ├── UploadProgress.tsx
    │   └── FileList.tsx
    │
    └── /viewer
        ├── DocumentViewer.tsx
        ├── DocumentToolbar.tsx
        └── PageNavigation.tsx