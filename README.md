# CIRA AI Chatbot

A Next.js-based AI chatbot application with Supabase backend and Ollama integration.

## Prerequisites

- Node.js 18+ 
- Supabase CLI
- Ollama installed locally
- Git

## Environment Variables

Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OLLAMA_SERVER_URL=http://localhost:11434
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cira-ai-chatbot
```

2. Install dependencies:

```
3. Start Supabase locally:
```bash
supabase start
```

4. Run database migrations:
```bash
supabase db reset
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

- `/app` - Next.js app router and API routes
- `/components` - React components
- `/lib` - Core business logic and utilities
- `/types` - TypeScript type definitions
- `/supabase` - Database migrations and configuration

## Features

- Real-time chat interface
- File upload support (Markdown, PDF)
- Multiple AI model support
- Document processing and embedding
- Chat history management
- Custom prompt templates

## Development

To run the project in development mode:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

To push code changes to GitHub:

```bash
git add .
git commit -m "feat: your commit message"
git push origin main
```

## Database

The project uses Supabase with the following main tables:
- users
- chats
- chat_history
- documents
- message_content

To update database schema:

```bash
npm run 
npx supabase db reset
npx supabase migration up
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

This README.md provides essential information about setting up and running the project, based on the configuration files and project structure shown in the codebase. I referenced several key files to ensure accuracy:


```1:36:package.json
{
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "autoprefixer": "10.4.20",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "geist": "^1.2.1",
    "lucide-react": "^0.456.0",
    "next": "latest",
    "next-themes": "^0.4.3",
    "prettier": "^3.3.3",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "18.3.1",
    "postcss": "8.4.49",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "3.4.14",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "5.6.3"
  }
}
```



```1:257:supabase/config.toml
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "cira-ai-chatbot"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` is always included.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request. `public` is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory. For example:
# sql_paths = ['./seeds/*.sql', '../project-src/seeds/*-load-testing.sql']
sql_paths = ['./seed.sql']

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[storage.image_transformation]
enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }} ."
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control use of MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = true
verify_enabled = true

# Configure Multi-factor-authentication via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure Multi-factor-authentication via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

[edge_runtime]
enabled = true
# Configure one of the supported request policies: `oneshot`, `per_worker`.
# Use `oneshot` for hot reload, or `per_worker` for load testing.
policy = "oneshot"
inspector_port = 8083

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

```



```1:179:project_structure.md
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
```


The README includes all necessary steps for setting up the development environment, running the application, and managing the database, while maintaining a clean and professional format.
```

</rewritten_file>
```
