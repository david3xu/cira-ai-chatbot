// import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// import { streamResponse } from './stream-response.ts'

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }

// serve(async (req: Request) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     const supabaseUrl = Deno.env.get('SUPABASE_URL');
//     const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

//     if (!supabaseUrl || !supabaseKey) {
//       throw new Error('Missing Supabase environment variables');
//     }

//     const supabaseClient = createClient(supabaseUrl, supabaseKey);
//     const { messages, model, temperature } = await req.json();
//     const response = await streamResponse(messages, model, temperature);
    
//     return new Response(response.body, {
//       headers: {
//         ...corsHeaders,
//         'Content-Type': 'text/event-stream',
//       },
//     });
//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 500,
//     });
//   }
// }); 