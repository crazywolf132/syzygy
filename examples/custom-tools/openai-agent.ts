import { AgentBuilder } from '../../src';

// Note: In a real application, you would use the actual OpenAI SDK
interface MockOpenAIResponse {
  choices: Array<{ message: { content: string } }>;
}

// Create a custom OpenAI tool
const openAITool = {
  name: 'openai',
  execute: async ({ prompt, model = 'gpt-3.5-turbo' }: { prompt: string; model?: string }) => {
    // This is a mock implementation. In a real application, you would use the OpenAI API
    console.log(`[OpenAI Mock] Using model: ${model}`);
    console.log(`[OpenAI Mock] Prompt: ${prompt}`);

    // Simulate different responses based on the prompt
    let response: string;
    if (prompt.includes('joke')) {
      response = "Why don't programmers like nature? It has too many bugs!";
    } else if (prompt.includes('quote')) {
      response = "Code is like humor. When you have to explain it, it's bad. - Cory House";
    } else {
      response = `Here's a response to: ${prompt}`;
    }

    // Return in the format of OpenAI's API response
    return {
      choices: [{ message: { content: response } }]
    } as MockOpenAIResponse;
  }
};

// Create an agent that uses the OpenAI tool
const openAIAgent = new AgentBuilder({
  name: 'OpenAIAgent',
  description: 'Interacts with OpenAI models'
})
  .withTool(openAITool)
  .withHandler(async (input, context) => {
    // Process the input to determine what to ask OpenAI
    const response = await context.tools.get('openai')?.execute({
      prompt: input,
      model: 'gpt-3.5-turbo' // You could make this configurable
    });

    // Extract the response from the OpenAI format
    return response?.choices[0].message.content || 'No response generated';
  })
  .build();

// Example usage
async function main() {
  try {
    // Ask for a programming joke
    console.log('Asking for a joke...');
    console.log(await openAIAgent.handle('Tell me a programming joke'));

    // Ask for a programming quote
    console.log('\nAsking for a quote...');
    console.log(await openAIAgent.handle('Share a programming quote'));

    // Ask a general question
    console.log('\nAsking a general question...');
    console.log(await openAIAgent.handle('What is the best programming language?'));
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 