import { AgentBuilder, AgentOrchestrator } from '../../src';

// Create a data fetcher agent
const fetcherAgent = new AgentBuilder({
  name: 'FetcherAgent',
  description: 'Fetches data from various sources'
})
  .withTool({
    name: 'fetchData',
    execute: async ({ source }: { source: string }) => {
      // Simulate fetching data from different sources
      const mockData: Record<string, any[]> = {
        users: [
          { id: 1, name: 'Alice', role: 'admin' },
          { id: 2, name: 'Bob', role: 'user' },
        ],
        products: [
          { id: 1, name: 'Widget', price: 99.99 },
          { id: 2, name: 'Gadget', price: 149.99 },
        ],
      };
      return mockData[source] || [];
    },
  })
  .withHandler(async (input, context) => {
    const source = input.toLowerCase();
    const data = await context.tools.get('fetchData')?.execute({ source });
    return data;
  })
  .build();

// Create a data transformer agent
const transformerAgent = new AgentBuilder({
  name: 'TransformerAgent',
  description: 'Transforms data into different formats'
})
  .withTool({
    name: 'transform',
    execute: async ({ data, format }: { data: any[]; format: string }) => {
      switch (format) {
        case 'csv':
          if (data.length === 0) return '';
          const headers = Object.keys(data[0]).join(',');
          const rows = data.map(item => Object.values(item).join(','));
          return [headers, ...rows].join('\n');
        case 'html':
          if (data.length === 0) return '<table></table>';
          const headerCells = Object.keys(data[0]).map(h => `<th>${h}</th>`).join('');
          const bodyCells = data.map(item => 
            `<tr>${Object.values(item).map(v => `<td>${v}</td>`).join('')}</tr>`
          ).join('');
          return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyCells}</tbody></table>`;
        default:
          return JSON.stringify(data, null, 2);
      }
    },
  })
  .withHandler(async (input, context) => {
    const [format, ...data] = input.split(':');
    return await context.tools.get('transform')?.execute({ 
      data: JSON.parse(data.join(':')),
      format 
    });
  })
  .build();

// Create an orchestrator to combine the agents
const orchestrator = AgentOrchestrator.create()
  .add(fetcherAgent)
  .add(transformerAgent)
  .onError((err) => console.error('Workflow error:', err));

// Example workflow: Fetch data and transform it into different formats
async function main() {
  try {
    // Sequential workflow: Fetch users -> Transform to CSV
    const userData = await orchestrator.runSequential('users');
    console.log('Users as CSV:');
    console.log(await transformerAgent.handle(`csv:${JSON.stringify(userData)}`));

    // Sequential workflow: Fetch products -> Transform to HTML
    const productData = await orchestrator.runSequential('products');
    console.log('\nProducts as HTML:');
    console.log(await transformerAgent.handle(`html:${JSON.stringify(productData)}`));

    // Parallel workflow: Fetch both users and products simultaneously
    const [parallelUsers, parallelProducts] = await orchestrator.runParallel('users\nproducts');
    console.log('\nParallel fetched data:');
    console.log('Users:', parallelUsers);
    console.log('Products:', parallelProducts);
  } catch (err) {
    console.error('Error:', err);
  }
}

main(); 