import { UIComponent } from './generative-ui';

/**
 * Configuration for the live preview renderer.
 */
export interface LivePreviewConfig {
  /**
   * Whether to include required framework dependencies.
   * @default true
   */
  includeFrameworkDependencies?: boolean;

  /**
   * Whether to include required library dependencies.
   * @default true
   */
  includeLibraryDependencies?: boolean;

  /**
   * Custom CSS to inject into the preview.
   */
  customCSS?: string;

  /**
   * Custom scripts to inject into the preview.
   */
  customScripts?: string[];
}

/**
 * Default configuration for the live preview.
 */
const DEFAULT_CONFIG: Required<LivePreviewConfig> = {
  includeFrameworkDependencies: true,
  includeLibraryDependencies: true,
  customCSS: '',
  customScripts: [],
};

/**
 * Renders a live preview of a generated UI component in the browser.
 */
export class LivePreview {
  private config: Required<LivePreviewConfig>;
  private mountPoint: HTMLElement;
  private currentComponent?: UIComponent;
  private iframe?: HTMLIFrameElement;

  constructor(mountPoint: HTMLElement, config: LivePreviewConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    this.mountPoint = mountPoint;
  }

  /**
   * Render a component in the preview.
   */
  public async render(component: UIComponent): Promise<void> {
    this.currentComponent = component;
    await this.createPreviewIframe();
    await this.injectDependencies();
    await this.renderComponent();
  }

  /**
   * Update the current preview with a new component.
   */
  public async update(component: UIComponent): Promise<void> {
    if (!this.iframe) {
      await this.render(component);
      return;
    }

    this.currentComponent = component;
    await this.renderComponent();
  }

  /**
   * Destroy the preview and clean up resources.
   */
  public destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = undefined;
    }
    this.currentComponent = undefined;
  }

  private async createPreviewIframe(): Promise<void> {
    // Remove existing iframe if it exists
    if (this.iframe) {
      this.iframe.remove();
    }

    // Create a new iframe
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.mountPoint.appendChild(this.iframe);

    // Initialize iframe content
    const doc = this.iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Syzygy Live Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    ${this.config.customCSS}
  </style>
</head>
<body>
  <div id="preview-root"></div>
</body>
</html>
    `);
    doc.close();
  }

  private async injectDependencies(): Promise<void> {
    if (!this.iframe?.contentDocument) return;

    const { framework } = this.currentComponent || {};
    const doc = this.iframe.contentDocument;
    const head = doc.head;

    if (this.config.includeFrameworkDependencies) {
      await this.injectFrameworkDependencies(head, framework);
    }

    if (this.config.includeLibraryDependencies) {
      await this.injectLibraryDependencies(head, framework);
    }

    // Inject custom scripts
    for (const script of this.config.customScripts) {
      const scriptEl = doc.createElement('script');
      scriptEl.textContent = script;
      head.appendChild(scriptEl);
    }
  }

  private async injectFrameworkDependencies(head: HTMLHeadElement, framework?: string): Promise<void> {
    switch (framework) {
      case 'react':
        await this.injectReactDependencies(head);
        break;
      case 'vue':
        await this.injectVueDependencies(head);
        break;
      case 'svelte':
        await this.injectSvelteDependencies(head);
        break;
      case 'angular':
        await this.injectAngularDependencies(head);
        break;
    }
  }

  private async injectLibraryDependencies(head: HTMLHeadElement, framework?: string): Promise<void> {
    // Inject common UI library dependencies (e.g., Material UI, Tailwind)
    const commonDeps = [
      'https://unpkg.com/@mui/material@latest/umd/material-ui.development.js',
      'https://cdn.tailwindcss.com',
    ];

    for (const dep of commonDeps) {
      const script = document.createElement('script');
      script.src = dep;
      head.appendChild(script);
    }
  }

  private async injectReactDependencies(head: HTMLHeadElement): Promise<void> {
    const scripts = [
      'https://unpkg.com/react@latest/umd/react.development.js',
      'https://unpkg.com/react-dom@latest/umd/react-dom.development.js',
    ];

    for (const src of scripts) {
      const script = document.createElement('script');
      script.src = src;
      head.appendChild(script);
    }
  }

  private async injectVueDependencies(head: HTMLHeadElement): Promise<void> {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vue@latest';
    head.appendChild(script);
  }

  private async injectSvelteDependencies(head: HTMLHeadElement): Promise<void> {
    // Svelte components are compiled to vanilla JS
    // No runtime dependencies needed
  }

  private async injectAngularDependencies(head: HTMLHeadElement): Promise<void> {
    // Angular requires more complex setup
    // In a real implementation, you might use a bundler or serve pre-compiled components
  }

  private async renderComponent(): Promise<void> {
    if (!this.iframe?.contentDocument || !this.currentComponent) return;

    const doc = this.iframe.contentDocument;
    const root = doc.getElementById('preview-root');
    if (!root) return;

    // Insert the component code
    const script = doc.createElement('script');
    script.textContent = `
      try {
        const component = (function() {
          ${this.currentComponent.render()}
          return GeneratedComponent;
        })();

        const root = document.getElementById('preview-root');
        
        // Framework-specific rendering
        switch ('${this.currentComponent.framework}') {
          case 'react':
            ReactDOM.render(React.createElement(component), root);
            break;
          case 'vue':
            new Vue({
              render: h => h(component),
            }).$mount(root);
            break;
          case 'svelte':
            new component({ target: root });
            break;
          case 'angular':
            // Angular requires more complex setup
            console.warn('Angular live preview not yet implemented');
            break;
        }
      } catch (err) {
        console.error('Error rendering preview:', err);
        document.getElementById('preview-root').innerHTML = 
          '<div style="color: red;">Error rendering preview: ' + err.message + '</div>';
      }
    `;
    doc.body.appendChild(script);
  }
} 