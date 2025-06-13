// tools.ts

// Define the allowed JSON‐Schema “type” strings
export type JSONSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array";

// A generic schema for a single property of type T
export interface JSONSchemaProperty<T = unknown> {
  /** The JSON‐schema type tag */
  type: JSONSchemaType;
  /** Human‐readable description */
  description?: string;
  /** If this property only allows a fixed set of values */
  enum?: T[];
  /** If type==="array", describe the items */
  items?: T extends Array<infer U> ? JSONSchemaProperty<U> : never;
  /** If type==="object", describe sub-properties */
  properties?: T extends object
    ? { [K in keyof T]: JSONSchemaProperty<T[K]> }
    : never;
  /** Any other JSON-Schema keywords you want to permit */
  [keyword: string]: unknown;
}

// Now your top-level “object” schema, mapping each key K → JSONSchemaProperty<P[K]>
export interface JSONSchema<P extends object> {
  type: "object";
  properties: {
    [K in keyof P]: JSONSchemaProperty<P[K]>;
  };
  required: readonly (keyof P)[];
}

/** 
 * A Tool takes an Args-shape P and returns a result R 
 */
export interface Tool<P extends object, R> {
  /** Unique name */
  name: string;
  /** Human-readable description */
  description: string;
  /** JSON-schema for P */
  parameters: JSONSchema<P>;

  /** 
   * Invoke with exactly P, get a R back 
   */
  invoke(args: P): Promise<R>;
}

/**
 * Abstract base you subclass for each new tool.
 *   - P is the shape of the args
 *   - R is the shape of what you return
 */
export abstract class BaseTool<P extends object, R> implements Tool<P, R> {
  abstract name: string;
  abstract description: string;
  abstract parameters: JSONSchema<P>;
  abstract invoke(args: P): Promise<R>;
}

/** 
 * Now your echo tool can plug in its own types cleanly:
 */
export interface EchoArgs { message: string }
export interface EchoResult { echo: string }

export class EchoTool extends BaseTool<EchoArgs, EchoResult> {
  name = "echo";
  description = "Returns back the `message` you provide";
  parameters = {
    type: "object" as const,
    properties: {
      message: {
        type: "string" as const,
        description: "The text to echo back"
      }
    },
    required: ["message"] as const
  };

  async invoke({ message }: EchoArgs): Promise<EchoResult> {
    return { echo: message };
  }
}