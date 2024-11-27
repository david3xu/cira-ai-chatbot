openapi: 3.0.0
info:
  title: Chat API
  version: 1.0.0
  description: API endpoints for chat functionality

paths:
  /api/chat/new:
    post:
      summary: Create a new chat session
      description: |
        Creates a new chat thread with optional initialization parameters.
        Validates the model existence before creation.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - model
                - dominationField
              properties:
                model:
                  type: string
                  description: The AI model to use for this chat
                dominationField:
                  type: string
                  description: Domain/context for the chat
                name:
                  type: string
                  description: Optional chat name (defaults to "New Chat")
                customPrompt:
                  type: string
                  description: Optional custom system prompt
                metadata:
                  type: object
                  description: Optional additional metadata
                chatId:
                  type: string
                  format: uuid
                  description: Optional pre-generated chat ID
      responses:
        '200':
          description: Chat created successfully
          content:
            application/json:
              example:
                chat:
                  id: "123e4567-e89b-12d3-a456-426614174000"
                  model: "llama2"
                  domination_field: "general"
                  name: "New Chat"
                  messages: []
                  historyLoaded: true

  /api/chat:
    post:
      summary: Send message and get AI response
      description: |
        Main chat endpoint that handles:
        1. Message validation
        2. Chat existence verification
        3. Streaming AI response
        4. Message storage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - message
                - chatId
                - dominationField
                - model
              properties:
                message:
                  type: string
                  description: User's message
                chatId:
                  type: string
                  format: uuid
                  description: Chat session ID
                dominationField:
                  type: string
                  description: Domain/context for the message
                customPrompt:
                  type: string
                  description: Optional custom system prompt
                imageFile:
                  type: string
                  description: Optional base64 image or URL
                model:
                  type: string
                  description: AI model to use
                skipMessageStorage:
                  type: boolean
                  description: Optional flag to skip message storage
      responses:
        '200':
          description: Streaming response
          content:
            text/event-stream:
              schema:
                type: string

  /api/chat/{chatId}:
    get:
      summary: Fetch chat history
      parameters:
        - name: chatId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Chat messages retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  messages:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChatMessage'

components:
  schemas:
    ChatMessage:
      type: object
      properties:
        id:
          type: string
          format: uuid
        chat_id:
          type: string
          format: uuid
        message_pair_id:
          type: string
          format: uuid
        user_content:
          type: string
        assistant_content:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
```

This documentation file provides a comprehensive overview of the chat API endpoints, their usage, and implementation details.