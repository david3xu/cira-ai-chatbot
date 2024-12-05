The project includes:
  Real-time chat interface
  File upload support
  Multiple AI model support
  Document processing
  Chat history management
  Custom prompt templates

Project Structure Overview:

1. Core Application Structure (/app)
- Next.js App Router with API routes
- Global styles
- Root layout

2. React Components (/components)
/* Component Architecture Notes */

/providers
  /* Manages global state and context distribution */
  - ChatProvider: Handles chat state and real-time updates
  - DocumentProvider: Manages document state and processing
  - ThemeProvider: Controls UI theme and preferences

/ui
  /* Reusable atomic components following design system */
  /* All components should be stateless and highly reusable */
  /* Forms foundation for consistent UI across the application */

/chat
  /conversation
    /* Main chat interface container */
    - ChatContainer: Orchestrates chat layout and state
    - ChatHeader: Navigation and chat meta information
    - ChatBody: Main message display area with scroll management

  /messages
    /* Message display and interaction */
    - MessageList: Virtualized list for performance
    - MessageItem: Individual message rendering
    - MessageActions: Message-specific interactions

  /input
    /* User input handling */
    - ChatInput: Rich text input with markdown support
    - InputActions: Message controls and attachments
    - AttachmentButton: File upload integration

  /sidebar
    /* Chat navigation and history */
    - ChatHistory: Conversation list and management
    - ChatFilter: Search and filtering capabilities
    - HistoryItem: Individual conversation preview

/document
  /* Document handling components */
  /uploader
    - FileUpload: Handles file selection and upload
    - UploadProgress: Visual feedback for upload status
    - FileList: Manages multiple file uploads

  /viewer
    - DocumentViewer: Document rendering and navigation
    - DocumentToolbar: Document control actions
    - PageNavigation: Multi-page document navigation

3. Core Business Logic (/lib)
/* Business Logic Architecture Notes */

/features
  /chat
    /* Core chat functionality */
    actions/
      - sendMessage: Handles message transmission and retry
      - editMessage: Message modification with history
      - deleteMessage: Safe message removal with confirmation

    hooks/
      - useChat: Main chat interaction hook
      - useChatHistory: History management and pagination
      - useChatInput: Input state and validation

    utils/
      - messageFormatter: Message parsing and formatting
      - chatStorage: Local chat data management

  /ai
    /* AI model integration */
    models/
      - openai: OpenAI API integration
      - ollama: Local model integration
      - anthropic: Anthropic API integration

    actions/
      - modelSelection: Model switching and configuration
      - streamResponse: Streaming response handling
      - contextManagement: Conversation context handling

    utils/
      - tokenCounter: Token usage tracking
      - promptFormatter: Template processing

  /document
    /* Document processing */
    actions/
      - uploadDocument: File upload and validation
      - processDocument: Document parsing and extraction
      - extractContent: Content extraction and processing

    hooks/
      - useDocument: Document state management
      - useDocumentUpload: Upload progress tracking
      - useDocumentViewer: Document viewing controls

/core
  /* Core services */
  /api
    - apiClient: Centralized API communication
    - errorHandling: Global error management

  /storage
    - localStorage: Client-side storage
    - supabaseStorage: Cloud storage integration

  /auth
    - authentication: User authentication
    - authorization: Access control

  /websocket
    - socketClient: Real-time communication
    - realTimeHandlers: Socket event handling

Key Integration Points:
1. Components use hooks from /features for data management
2. Core services provide infrastructure for features
3. Features implement business logic independent of UI
4. Providers bridge components and features

4. TypeScript Types (/types)
- Global type definitions
- API types
- Chat types
- Document types

5. Backend Integration
- Supabase integration
  - Database migrations
  - Serverless functions
  - Configuration

6. Key Technologies:
- Next.js
- React 18
- Supabase
- Tailwind CSS
- Radix UI components
- Markdown processing
- OpenAI integration

7. Architecture Patterns:
- Feature-first architecture
- Clean separation of concerns
- Context-based state management
- Service-based backend integration
- Type-safe development
- API-first design

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

Integration Notes:

1. API Route Handlers:
   /* Each route should have dedicated handler in /app/api */
   - Consistent error handling
   - Request validation
   - Response type safety
   - Rate limiting implementation

2. Middleware Integration:
   /* Applied consistently across routes */
   - Authentication checking
   - Request logging
   - Performance monitoring
   - CORS handling

3. API Security:
   /* Security measures for all endpoints */
   - Rate limiting
   - Input validation
   - Authentication checks
   - CSRF protection

4. Response Patterns:
   /* Standardized response structure */
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: {
       code: string;
       message: string;
       details?: unknown;
     };
     metadata?: {
       timestamp: string;
       requestId: string;
     };
   }
   ```

5. Integration with Core Services:
   - API routes utilize /lib/core/api for common functionality
   - Error handling uses /lib/core/errorHandling
   - Authentication uses /lib/core/auth
   - Real-time features use /lib/core/websocket

6. Type Safety:
   - All endpoints have corresponding request/response types
   - Zod validation schemas for runtime checking
   - Shared types between frontend and API

Potential Improvements:
1. Add API versioning (/api/v1/...)
2. Implement request/response compression
3. Add request caching strategy
4. Enhance monitoring and logging
5. Add API documentation generation

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

React Component Relationships:

1. Provider Layer (Top Level)
/* Provides global state and context */
ChatProvider ─────┐
                 ├──> All Components (via Context)
DocumentProvider ─┤
ThemeProvider ────┘

2. Main Component Hierarchy