// export async function streamResponse(
//   messages: any[],
//   model: string,
//   temperature: number
// ) {
//   const encoder = new TextEncoder()
//   const stream = new TransformStream()
//   const writer = stream.writable.getWriter()

//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
//       },
//       body: JSON.stringify({
//         model,
//         messages,
//         temperature,
//         stream: true,
//       }),
//     })

//     const reader = response.body!.getReader()
//     const decoder = new TextDecoder()

//     while (true) {
//       const { done, value } = await reader.read()
//       if (done) break

//       const chunk = decoder.decode(value)
//       await writer.write(encoder.encode(chunk))
//     }
//   } catch (error) {
//     console.error('Error:', error)
//     await writer.write(encoder.encode(`error: ${error.message}`))
//   } finally {
//     await writer.close()
//   }

//   return new Response(stream.readable, {
//     headers: { 'Content-Type': 'text/event-stream' },
//   })
// } 