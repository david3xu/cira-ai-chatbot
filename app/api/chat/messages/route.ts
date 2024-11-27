import { supabase, supabaseAdmin } from "@/lib/supabase/client";

export async function PATCH(req: Request) {
  const { messagePairId, assistantContent, status } = await req.json();
  
  const { data, error } = await supabaseAdmin.rpc(
    'store_chat_message',
    {
      message_data: {
        message_pair_id: messagePairId,
        assistant_content: assistantContent,
        updated_at: new Date().toISOString()
      },
      operation: 'update'
    }
  );

  if (error) throw error;
  return new Response(JSON.stringify(data));
}
