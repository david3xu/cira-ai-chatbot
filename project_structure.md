📦 Root
├── 📂 supabase/
│   ├── 📂 migrations/           # Database migrations
│   │   ├── 20240308100100_create_extensions.sql
│   │   ├── 20240308100200_create_functions.sql
│   │   ├── 20240308100300_create_users.sql
│   │   ├── 20240308100400_create_chats.sql
│   │   ├── 20240308100500_create_chat_history.sql
│   │   ├── 20240308100600_create_documents.sql
│   │   ├── 20240308100700_create_files.sql
│   │   ├── 20240308100800_create_model_settings.sql
│   │   └── 20240308100900_create_hybrid_search.sql
│   ├── 📂 functions/           # Edge functions
│   │   └── 📂 chat/
│   │       ├── index.ts        # Edge function entry
│   │       └── stream-response.ts # Streaming helper
│   ├── 📂 types/              # Supabase types
│   │   ├── database.types.ts   # Generated types
│   │   └── supabase.ts        # Client types
│   ├── config.toml            # Supabase config
│   └── seed.sql               # Initial data
├── 📂 app/
│   ├── 📂 chat/               # Chat pages
│   │   ├── page.tsx           # Main chat page
│   │   ├── layout.tsx         # Chat layout
│   │   ├── loading.tsx        # Loading state
│   │   ├── error.tsx          # Error handling
│   │   └── not-found.tsx      # 404 page
│   └── 📂 api/                # API routes
│       ├── 📂 auth/
│       │   └── route.ts       # Authentication endpoints
│       ├── 📂 chat/
│       │   ├── route.ts       # Main chat endpoints
│       │   ├── 📂 [chatId]/
│       │   │   ├── route.ts   # Chat operations
│       │   │   └── 📂 message/
│       │   │       └── route.ts # Message operations
│       │   ├── 📂 model/
│       │   │   ├── route.ts   # Model config
│       │   │   └── 📂 settings/
│       │   │       └── route.ts # Model settings
│       │   └── 📂 files/
│       │       └── route.ts   # File operations
│       ├── 📂 ai/             # AI endpoints
│       │   ├── 📂 completion/
│       │   │   ├── route.ts   # Completion endpoint
│       │   │   └── stream/route.ts # Streaming endpoint
│       │   ├── 📂 models/
│       │   │   ├── route.ts   # Models list
│       │   │   └── switch/route.ts # Model switching
│       │   └── 📂 context/
│       │       └── route.ts   # Context management
│       └── 📂 documents/      # Document endpoints
│           ├── route.ts       # Document operations
│           ├── upload/route.ts # Upload endpoint
│           └── process/route.ts # Processing endpoint
├── 📂 components/
│   ├── 📂 ui/                 # Shared UI components
│   │   ├── textarea.tsx
│   │   ├── button.tsx
│   │   ├── alert-dialog.tsx
│   │   └── loading-spinner.tsx
│   ├── 📂 chat/              # Chat components
│   │   ├── 📂 conversation/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   └── ChatBody.tsx
│   │   ├── 📂 messages/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   └── MessageActions.tsx
│   │   ├── 📂 input/
│   │   │   ├── ChatInput.tsx
│   │   │   ├── InputActions.tsx
│   │   │   └── AttachmentButton.tsx
│   │   ├── 📂 sidebar/
│   │   │   ├── ChatSidebar.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── ChatListItem.tsx
│   │   │   ├── NewChatButton.tsx
│   │   │   └── CustomPromptInput.tsx
│   │   ├── 📂 model/
│   │   │   ├── ModelSelector.tsx
│   │   │   └── ModelConfig.tsx
│   │   └── 📂 uploader/
│   │       ├── FileUploader.tsx
│   │       ├── UploadProgress.tsx
│   │       └── FileList.tsx
│   └── 📂 providers/         # Context providers
│       ├── 📂 chat/
│       │   ├── ChatProvider.tsx
│       │   ├── ChatUIProvider.tsx
│       │   ├── ChatDomainProvider.tsx
│       │   ├── ChatAPIProvider.tsx
│       │   └── index.ts
│       └── index.ts
├── 📂 lib/
│   ├── 📂 services/          # Service layer
│   │   ├── 📂 base/
│   │   │   └── ApiService.ts
│   │   ├── ChatService.ts
│   │   ├── DocumentService.ts
│   │   ├── StorageService.ts
│   │   ├── ModelService.ts
│   │   └── UploaderService.ts
│   ├── 📂 hooks/            # Custom hooks
│   │   ├── useChat.ts
│   │   ├── useChatMessage.ts
│   │   ├── useChatSidebar.ts
│   │   ├── useModelSelector.ts
│   │   ├── useFileUploader.ts
│   │   └── index.ts
│   └── 📂 types/            # Type definitions
│       ├── 📂 state/
│       │   ├── chat.ts
│       │   ├── model.ts
│       │   └── uploader.ts
│       └── 📂 api/
│           ├── requests.ts
│           └── responses.ts
└── 📂 config/               # Configuration
    ├── supabase.ts         # Supabase config
    └── openai.ts           # OpenAI config