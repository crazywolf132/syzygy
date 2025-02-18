import { z } from 'zod';
import { AgentBuilder, AgentWithUI, ReactComponentOption } from '../../src';

// Define Zod schemas for form fields
const userFormSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Define Material UI component options with Zod schemas
const formFieldOptions: ReactComponentOption[] = [
  {
    name: "TextField",
    component: {} as any, // In real code, this would be MUI TextField
    propsSchema: z.object({
      label: z.string(),
      type: z.enum(["text", "email", "password", "number"]),
      value: z.string(),
      onChange: z.function(),
      error: z.boolean().optional(),
      helperText: z.string().optional(),
      required: z.boolean().optional(),
    }),
    description: "Material UI text input field",
  },
  {
    name: "Button",
    component: {} as any, // In real code, this would be MUI Button
    propsSchema: z.object({
      variant: z.enum(["contained", "outlined", "text"]),
      color: z.enum(["primary", "secondary", "error"]),
      type: z.enum(["submit", "button", "reset"]),
      disabled: z.boolean().optional(),
      children: z.string(),
    }),
    description: "Material UI button component",
  },
];

// Create a custom form validation agent
class FormValidationAgent extends AgentWithUI<string, string> {
  async handle(input: string): Promise<string> {
    try {
      if (input.includes("generate form")) {
        // Generate a complete form using component selection
        const formComponent = await this.generateComponentFromOptions(
          "Create a user registration form with validation"
        );
        return `Generated Form Component:\n${formComponent.render()}`;
      }

      if (input.includes("validate")) {
        // Example validation
        const testData = {
          username: "john_doe",
          email: "invalid-email",
          age: 15,
          password: "weak",
          confirmPassword: "different",
        };

        try {
          userFormSchema.parse(testData);
          return "Form data is valid";
        } catch (err) {
          if (err instanceof z.ZodError) {
            return `Validation errors:\n${JSON.stringify(err.errors, null, 2)}`;
          }
          throw err;
        }
      }

      return "Unknown command. Try 'generate form' or 'validate'";
    } catch (error) {
      this.context.logger?.error(`Error in FormValidationAgent: ${error}`);
      throw error;
    }
  }
}

// Create the form validation agent using the builder
const formAgent = new AgentBuilder({
  name: "FormValidationAgent",
  description: "Generates and validates form components",
})
  .withHandler(async (input, context) => {
    const agent = new FormValidationAgent(
      {
        name: "FormValidationAgent",
        description: "Generates and validates form components",
      },
      context,
      {
        availableComponents: formFieldOptions,
        componentGenerator: undefined, // Using component selection approach
      }
    );
    return await agent.handle(input);
  })
  .build();

// Example usage
async function main() {
  try {
    // Generate a form component
    console.log("\nGenerating a form component:");
    console.log(await formAgent.handle("generate form"));

    // Test form validation
    console.log("\nTesting form validation:");
    console.log(await formAgent.handle("validate"));
  } catch (err) {
    console.error("Error:", err);
  }
}

main(); 