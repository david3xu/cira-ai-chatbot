📦 Root
├── 📂 app/                            # Next.js app router
│   ├── 📂 api/                        
│   │   ├── 📂 chat/
│   │   │   ├── 📄 route.ts
│   │   │   ├── 📄 init/route.ts
│   │   │   ├── 📄 store/route.ts
│   │   │   └── 📄 update-model/route.ts
│   │   ├── 📂 ollama/
│   │   │   ├── 📄 route.ts              # Embedding endpoint
│   │   │   ├── 📄 chat/route.ts
│   │   │   └── 📄 update-model/route.ts
│   │   ├── 📄 answer/route.ts
│   │   ├── 📄 convertPdf/route.ts
│   │   ├── 📄 documentChat/route.ts
│   │   └── 📄 uploadMarkdown/route.ts
│   ├── 📄 globals.css
│   └── 📄 layout.tsx
│
├── 📂 components/                     
│   ├── 📂 providers/                  # All context providers
│   │   ├── 📂 chat/
│   │   │   ├── 📄 ChatProvider.tsx
│   │   │   ├── 📄 types.ts
│   │   │   └── 📄 index.ts
│   │   └── 📄 index.ts
│   ├── 📂 ui/                        # Shared UI components
│   │   ├── 📄 textarea.tsx
│   │   ├── 📄 button.tsx
│   │   └── 📄 alert-dialog.tsx
│   │
│   ├── 📂 chat/                      
│   │   ├── 📂 area/                  # Chat area components
│   │   │   ├── 📄 ChatArea.tsx
│   │   │   ├── 📄 ChatHeader.tsx
│   │   │   ├── 📄 ModelSelector.tsx
│   │   │   ├── 📄 Sidebar.tsx
│   │   │   ├── 📄 CustomPromptArea.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📂 messages/             # Message components
│   │   │   ├── 📄 ChatMessages.tsx
│   │   │   ├── 📄 MessageBubble.tsx
│   │   │   ├── 📄 StreamingMessage.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📂 input/                # Input components
│   │   │   ├── 📄 MessageInputField.tsx
│   │   │   ├── 📄 FileUpload.tsx
│   │   │   ├── 📄 DocumentPreview.tsx
│   │   │   ├── 📄 ImagePreview.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📂 history/              # History components
│   │   │   ├── 📄 ChatHistoryDisplay.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📂 qa/                   # Question answering components
│   │   │   ├── 📄 QuestionAnswering.tsx
│   │   │   └── 📄 index.ts
│   │   └── 📂 types/               # Component types
│   │       └── 📄 index.ts
│   │
│   └── 📂 document/                # Document components
│       ├── 📂 uploader/
│       │   ├── 📄 MarkdownUploader.tsx
│       │   └── 📄 index.ts
│       └── 📂 viewer/
│           ├── 📄 DocumentViewer.tsx
│           └── 📄 index.ts
│
├── 📂 lib/                         
│   ├── 📂 features/               # Feature-based organization
│   │   ├── 📂 chat/              
│   │   │   ├── 📂 actions/       # Chat actions
│   │   │   │   ├── 📄 createChat.ts
│   │   │   │   ├── 📄 sendMessage.ts
│   │   │   │   ├── 📄 fetchHistory.ts
│   │   │   │   ├── 📄 storeMessage.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 hooks/         # Chat hooks
│   │   │   │   ├── 📄 useChat.ts
│   │   │   │   ├── 📄 useChatState.ts
│   │   │   │   ├── 📄 useChatMessaging.ts
│   │   │   │   ├── 📄 useMessageInput.ts
│   │   │   │   ├── 📄 useFileUpload.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 utils/         # Chat utilities
│   │   │   │   ├── 📄 chat.ts
│   │   │   │   ├── 📄 chatState.ts
│   │   │   │   ├── 📄 modelUtils.ts
│   │   │   │   ├── 📄 prompts.ts
│   │   │   │   ├── 📄 messageFormatting.ts
│   │   │   │   ├── 📄 fileHandling.ts
│   │   │   │   └── 📄 index.ts
│   │   │   └── 📂 types/         # Chat types
│   │   │       ├── 📄 chat.ts
│   │   │       └── 📄 index.ts
│   │   ├── 📂 ai/                # AI features
│   │   │   ├── 📂 actions/       # AI actions
│   │   │   │   ├── 📄 answerQuestion.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 services/      # AI services
│   │   │   │   ├── 📄 completionService.ts
│   │   │   │   ├── 📄 messageProcessor.ts
│   │   │   │   ├── 📄 ollamaService.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 utils/         # AI utilities
│   │   │   │   ├── 📄 embedding.ts
│   │   │   │   ├── 📄 responseFormatter.ts
│   │   │   │   ├── 📄 retry.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 prompts/       # AI prompts
│   │   │   │   ├── 📄 systemMessages.ts
│   │   │   │   └── 📄 index.ts
│   │   │   ├── 📂 config/        # AI configuration
│   │   │   │   ├── 📄 constants.ts
│   │   │   │   ├── 📄 openai.ts
│   │   │   │   └── 📄 index.ts
│   │   │   └── 📂 types/         # AI types
│   │   │       └── 📄 index.ts
│   │   │
│   │   └── 📂 document/          # Document features
│   │       ├── 📂 actions/       
│   │       │   ├── 📄 uploadDocument.ts
│   │       │   ├── 📄 processDocument.ts
│   │       │   └── 📄 index.ts
│   │       └── 📂 hooks/         
│   │           ├── 📄 useDocument.ts
│   │           └── 📄 index.ts
│   │
│   └── 📂 services/              # Core services
│       ├── 📂 chat/              
│       │   ├── 📄 ChatService.ts
│       │   └── 📄 index.ts
│       ├── 📂 ollama/            
│       │   ├── 📄 OllamaService.ts
│       │   └── 📄 index.ts
│       └── 📂 document/          
│           ├── 📂 processing/    
│           │   ├── 📄 FileProcessingService.ts
│           │   ├── 📄 PdfService.ts
│           │   ├── 📄 TextChunkingService.ts
│           │   └── 📄 index.ts
│           ├── 📂 embedding/     
│           │   ├── 📄 EmbeddingService.ts
│           │   └── 📄 index.ts
│           └── 📄 index.ts
│
├── 📂 types/                     # Global types
│   ├── 📂 chat/
│   │   ├── 📄 fileUpload.ts
│   │   ├── 📄 messageInput.ts
│   │   └── 📄 index.ts
│   ├── 📂 api/
│   │   └── 📄 index.ts
│   └── 📂 document/
│       └── 📄 index.ts
│
├── 📂 supabase/                  # Database
│   ├── 📂 migrations/
│   ├── 📂 functions/
│   ├── 📄 config.toml
│   ├── 📄 seed.sql
│   └── 📄 types.ts
│
├── 📂 scripts/                   # Scripts
│   ├── 📄 createDocsFolders.ts
│   ├── 📄 setup.ts
│   ├── 📄 migrate-structure.ts
│   └── 📄 uploadDocs.ts
│
├── 📂 public/                    # Static assets
│   └── 📄 pdf.min.mjs
│
├── 📂 docs/                      # Documentation
│   └── [domination field folders]
│
├── 📄 next.config.mjs
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tailwind.config.ts
└── 📄 components.json