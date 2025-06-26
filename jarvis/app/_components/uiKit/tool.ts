import { BaseTool, JSONSchema } from "@/utils/toolUtils";
import rawSchema from "./response.schema.json";
import { UIKitArgs } from "./base";

const responseSchema = rawSchema as unknown as JSONSchema<UIKitArgs>;

export class UIKitResult {}


export class UIKitTool extends BaseTool<UIKitArgs, UIKitResult> {
  name = "uiKit";
  description = "A tool for submitting UI components to be rendered for the user. Styling can be achieved using Tailwind CSS.";
  parameters = responseSchema;

  async invoke(args: UIKitArgs): Promise<UIKitResult> {
    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("UIKitTool invoked with args:", args);
    return {} as UIKitResult; // Return an empty result for now
  }

}