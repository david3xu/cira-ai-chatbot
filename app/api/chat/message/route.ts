// import { NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { StreamingTextResponse, LangChainStream } from 'ai';
// import { ChatOpenAI } from 'langchain/chat_models/openai';
// import { AIMessage, HumanMessage } from 'langchain/schema';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function POST(request: Request) {
//   try {
//     const { chatId, content, model, dominationField } = await request.json();
//     const messagePairId = crypto.randomUUID();

//     // Save user message using databaseActions
//     await databaseActions.saveMessage({
//       chatId,
//       content,
//       role: 'user',
//       messagePairId,
//       model,
//       dominationField,
//       status: 'sending'
//     });

//     // Get chat history using databaseActions
//     const messages = await databaseActions.getChatHistory(chatId);

//     // Prepare message history for LangChain
//     const history = messages.map(msg => 
//       msg.user_role === 'user' 
//         ? new HumanMessage(msg.user_content)
//         : new AIMessage(msg.assistant_content)
//     );

//     // Create streaming response
//     const { stream, handlers } = LangChainStream();
    
//     const llm = new ChatOpenAI({
//       modelName: model,
//       streaming: true,
//     });

//     // Start AI response generation
//     llm.call(
//       [...history, new HumanMessage(content)],
//       {},
//       [handlers]
//     ).catch(async (error) => {
//       // Update message status if there's an error
//       await databaseActions.updateMessageStatus(messagePairId, {
//         status: 'error'
//       });
//       console.error('Error in LLM call:', error);
//     });

//     return new StreamingTextResponse(stream);
//   } catch (error) {
//     console.error('Error processing message:', error);
//     return NextResponse.json(
//       { error: 'Failed to process message' },
//       { status: 500 }
//     );
//   }
// } 