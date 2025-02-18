# Multi-Framework UI Generation Example

This example demonstrates how to use Syzygy's UI generation capabilities to create components for multiple frontend frameworks (React, Vue, Svelte, and Angular) using a single agent.

## Features

- Unified interface for generating UI components across different frameworks
- Support for Material UI components
- Live preview functionality in browser environments
- TypeScript support
- Framework-specific optimizations:
  - React: Styled Components for CSS
  - Vue: Composition API
  - Svelte: TypeScript integration
  - Angular: Standalone components and Signals

## Usage

The example includes a `MultiFrameworkAgent` that can generate UI components based on natural language descriptions. Here's how to use it:

```typescript
// Generate a React component
await multiFrameworkAgent.handle('generate a React form');

// Generate a Vue component
await multiFrameworkAgent.handle('generate a Vue form');

// Generate a Svelte component
await multiFrameworkAgent.handle('generate a Svelte form');

// Generate an Angular component
await multiFrameworkAgent.handle('generate an Angular form');
```

### Live Preview

In browser environments, you can set up live preview functionality:

```html
<div id="preview"></div>
```

```typescript
if (typeof window !== 'undefined') {
  const previewContainer = document.getElementById('preview');
  if (previewContainer) {
    multiFrameworkAgent.setPreviewTarget(previewContainer);
  }
}
```

## Configuration

The example uses a set of common Material UI components that are available across all frameworks:

- Button
- Card
- TextField

Each framework's generator is configured with appropriate settings:

```typescript
// React configuration
{
  libraryComponents: commonComponents,
  useTypeScript: true,
  cssStrategy: 'styled-components'
}

// Vue configuration
{
  libraryComponents: commonComponents,
  useTypeScript: true,
  useCompositionAPI: true
}

// Svelte configuration
{
  libraryComponents: commonComponents,
  useTypeScript: true
}

// Angular configuration
{
  libraryComponents: commonComponents,
  useStandalone: true,
  useSignals: true
}
```

## Running the Example

1. Make sure you have all required dependencies installed:
   - @mui/material
   - styled-components (for React)
   - vue
   - svelte
   - @angular/core

2. Run the example:
   ```bash
   ts-node multi-framework-generator.ts
   ```

3. For browser preview, serve the example in a web environment and include the necessary framework dependencies. 