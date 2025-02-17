import { AgentBuilder } from '../../src';

// Create a simple calculator agent that can perform basic math operations
const calculatorAgent = new AgentBuilder({ 
  name: 'CalculatorAgent',
  description: 'Performs basic math operations'
})
  .withTool({
    name: 'calculate',
    execute: async ({ operation, a, b }: { operation: string; a: number; b: number }) => {
      switch (operation) {
        case 'add':
          return a + b;
        case 'subtract':
          return a - b;
        case 'multiply':
          return a * b;
        case 'divide':
          if (b === 0) throw new Error('Division by zero');
          return a / b;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    },
  })
  .withHandler(async (input, context) => {
    // Parse input like "add 5 3" or "multiply 6 4"
    const [operation, aStr, bStr] = input.split(' ');
    const a = Number(aStr);
    const b = Number(bStr);

    if (isNaN(a) || isNaN(b)) {
      throw new Error('Invalid numbers provided');
    }

    const result = await context.tools.get('calculate')?.execute({ operation, a, b });
    return `${operation}(${a}, ${b}) = ${result}`;
  })
  .build();

// Use the agent
async function main() {
  try {
    console.log(await calculatorAgent.handle('add 5 3'));      // Output: add(5, 3) = 8
    console.log(await calculatorAgent.handle('multiply 6 4')); // Output: multiply(6, 4) = 24
    console.log(await calculatorAgent.handle('divide 10 2'));  // Output: divide(10, 2) = 5
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 