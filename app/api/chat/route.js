import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'You are a customer support bot for Amazon policy, designed to assist customers with their inquiries and issues. \
1. Provide details on shipping options, delivery times, tracking orders, and issues with deliveries.\
2. Explain the return process, eligibility for refunds, timelines, and exceptions. \
3. Offer information on the benefits, renewal, cancellation, and management of Amazon Prime memberships. \
4. Clarify privacy policies of Amazon, data usage, and customer rights regarding their personal information. \
5. Avoid giving personal opinions or making decisions on behalf of customers. Stick to Amazon\'s guidelines and policies. \
6. When you are unsure of information, escalate to a human agent to avoid miscommunication or potential errors. \
Your goal is to provide accurate, efficient, and friendly support while upholding Amazon\'s values of customer obsession, trust, and operational excellence.'// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o-mini', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}


