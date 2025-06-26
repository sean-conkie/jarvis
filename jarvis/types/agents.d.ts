import { z } from "zod";

// Enums
export const InEnum = z.enum(["cookie", "header", "query"]);
export type In = z.infer<typeof InEnum>;

export const RoleEnum = z.enum(["agent", "user"]);
export type Role = z.infer<typeof RoleEnum>;

// Root models
export const A2ASchema = z.object({ root: z.any() });

// Security Schemes and Auth
export const APIKeySecuritySchemeSchema = z.object({
  description: z.string().optional().nullable(),
  in: InEnum,
  name: z.string(),
  type: z.literal("apiKey"),
});

export const HTTPAuthSecuritySchemeSchema = z.object({
  bearerFormat: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  scheme: z.string(),
  type: z.literal("http"),
});

export const OpenIdConnectSecuritySchemeSchema = z.object({
  description: z.string().optional().nullable(),
  openIdConnectUrl: z.string(),
  type: z.literal("openIdConnect"),
});

export const OAuthFlowsSchema = z.object({
  authorizationCode: z.object({
    authorizationUrl: z.string(),
    refreshUrl: z.string().optional().nullable(),
    scopes: z.record(z.string()),
    tokenUrl: z.string(),
  }).optional().nullable(),
  clientCredentials: z.object({
    refreshUrl: z.string().optional().nullable(),
    scopes: z.record(z.string()),
    tokenUrl: z.string(),
  }).optional().nullable(),
  implicit: z.object({
    authorizationUrl: z.string(),
    refreshUrl: z.string().optional().nullable(),
    scopes: z.record(z.string()),
  }).optional().nullable(),
  password: z.object({
    refreshUrl: z.string().optional().nullable(),
    scopes: z.record(z.string()),
    tokenUrl: z.string(),
  }).optional().nullable(),
});

export const OAuth2SecuritySchemeSchema = z.object({
  description: z.string().optional().nullable(),
  flows: OAuthFlowsSchema,
  type: z.literal("oauth2"),
});

export const SecuritySchemeUnion = z.union([
  APIKeySecuritySchemeSchema,
  HTTPAuthSecuritySchemeSchema,
  OAuth2SecuritySchemeSchema,
  OpenIdConnectSecuritySchemeSchema,
]);
export const SecuritySchemeSchema = z.object({ root: SecuritySchemeUnion });

// Errors
export const JSONParseErrorSchema = z.object({ code: z.literal(-32700), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const InvalidRequestErrorSchema = z.object({ code: z.literal(-32600), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const MethodNotFoundErrorSchema = z.object({ code: z.literal(-32601), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const InvalidParamsErrorSchema = z.object({ code: z.literal(-32602), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const InternalErrorSchema = z.object({ code: z.literal(-32603), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const TaskNotFoundErrorSchema = z.object({ code: z.literal(-32001), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const TaskNotCancelableErrorSchema = z.object({ code: z.literal(-32002), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const PushNotificationNotSupportedErrorSchema = z.object({ code: z.literal(-32003), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const UnsupportedOperationErrorSchema = z.object({ code: z.literal(-32004), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const ContentTypeNotSupportedErrorSchema = z.object({ code: z.literal(-32005), data: z.any().optional().nullable(), message: z.string().optional().nullable() });
export const InvalidAgentResponseErrorSchema = z.object({ code: z.literal(-32006), data: z.any().optional().nullable(), message: z.string().optional().nullable() });

export const A2AErrorSchema = z.object({
  root: z.union([
    JSONParseErrorSchema,
    InvalidRequestErrorSchema,
    MethodNotFoundErrorSchema,
    InvalidParamsErrorSchema,
    InternalErrorSchema,
    TaskNotFoundErrorSchema,
    TaskNotCancelableErrorSchema,
    PushNotificationNotSupportedErrorSchema,
    UnsupportedOperationErrorSchema,
    ContentTypeNotSupportedErrorSchema,
    InvalidAgentResponseErrorSchema,
  ]),
});

// Data Parts
export const PartBaseSchema = z.object({ metadata: z.record(z.any()).optional().nullable() });
export const TextPartSchema = PartBaseSchema.extend({ kind: z.literal("text"), text: z.string() });
export const DataPartSchema = PartBaseSchema.extend({ kind: z.literal("data"), data: z.record(z.any()) });
export const FileBaseSchema = z.object({ mimeType: z.string().optional().nullable(), name: z.string().optional().nullable() });
export const FileWithBytesSchema = FileBaseSchema.extend({ bytes: z.string() });
export const FileWithUriSchema = FileBaseSchema.extend({ uri: z.string() });
export const FilePartSchema = PartBaseSchema.extend({ kind: z.literal("file"), file: z.union([FileWithBytesSchema, FileWithUriSchema]) });

export const PartUnion = z.union([TextPartSchema, FilePartSchema, DataPartSchema]);
export const PartSchema = z.object({ root: PartUnion });

// Task and Artifacts
export const ArtifactSchema = z.object({
  artifactId: z.string(),
  description: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  name: z.string().optional().nullable(),
  parts: z.array(PartUnion),
});

// Messages
export const MessageSchema = z.object({
  contextId: z.string().optional().nullable(),
  kind: z.literal("message"),
  messageId: z.string(),
  metadata: z.record(z.any()).optional().nullable(),
  parts: z.array(PartUnion),
  referenceTaskIds: z.array(z.string()).optional().nullable(),
  role: RoleEnum,
  taskId: z.string().optional().nullable(),
});

// Task Status and Events
export const TaskStatusSchema = z.object({ message: MessageSchema.optional().nullable(), state: z.nativeEnum(z.enum(["submitted", "working", "input-required", "completed", "canceled", "failed", "rejected", "auth-required", "unknown"])), timestamp: z.string().optional().nullable() });
export type TaskState = z.infer<typeof TaskStatusSchema.shape.state>;

export const TaskSchema = z.object({
  artifacts: z.array(ArtifactSchema).optional().nullable(),
  contextId: z.string(),
  history: z.array(MessageSchema).optional().nullable(),
  id: z.string(),
  kind: z.literal("task"),
  metadata: z.record(z.any()).optional().nullable(),
  status: TaskStatusSchema,
});

// JSON-RPC Requests and Responses
const BaseRPC = z.object({ id: z.union([z.string(), z.number()]).optional().nullable(), jsonrpc: z.literal("2.0") });

export const SendMessageRequestSchema = BaseRPC.extend({ method: z.literal("message/send"), params: z.object({ configuration: z.object({ acceptedOutputModes: z.array(z.string()), blocking: z.boolean().optional().nullable(), historyLength: z.number().optional().nullable(), pushNotificationConfig: z.object({ authentication: z.object({ credentials: z.string().optional().nullable(), schemes: z.array(z.string()) }).optional().nullable(), token: z.string().optional().nullable(), url: z.string() }).optional().nullable(), }).optional().nullable(), message: MessageSchema, metadata: z.record(z.any()).optional().nullable() }) });

export const SendStreamingMessageRequestSchema = BaseRPC.extend({ method: z.literal("message/stream"), params: SendMessageRequestSchema.shape.params });

export const TaskIdParamsSchema = z.object({ id: z.string(), metadata: z.record(z.any()).optional().nullable() });
export const TaskQueryParamsSchema = TaskIdParamsSchema.extend({ historyLength: z.number().optional().nullable() });

export const GetTaskRequestSchema = BaseRPC.extend({ method: z.literal("tasks/get"), params: TaskQueryParamsSchema });
export const CancelTaskRequestSchema = BaseRPC.extend({ method: z.literal("tasks/cancel"), params: TaskIdParamsSchema });
export const SetTaskPushNotificationConfigRequestSchema = BaseRPC.extend({ method: z.literal("tasks/pushNotificationConfig/set"), params: z.object({ pushNotificationConfig: z.object({ authentication: z.object({ credentials: z.string().optional().nullable(), schemes: z.array(z.string()) }).optional().nullable(), token: z.string().optional().nullable(), url: z.string() }), taskId: z.string() }) });
export const GetTaskPushNotificationConfigRequestSchema = BaseRPC.extend({ method: z.literal("tasks/pushNotificationConfig/get"), params: TaskIdParamsSchema });
export const TaskResubscriptionRequestSchema = BaseRPC.extend({ method: z.literal("tasks/resubscribe"), params: TaskIdParamsSchema });

export const A2ARequestSchema = z.object({
  root: z.union([
    SendMessageRequestSchema,
    SendStreamingMessageRequestSchema,
    GetTaskRequestSchema,
    CancelTaskRequestSchema,
    SetTaskPushNotificationConfigRequestSchema,
    GetTaskPushNotificationConfigRequestSchema,
    TaskResubscriptionRequestSchema,
  ])
});

// Success Responses
export const SendMessageSuccessResponseSchema = BaseRPC.extend({ result: z.union([TaskSchema, MessageSchema]) });
export const SendStreamingMessageSuccessResponseSchema = BaseRPC.extend({ result: z.union([TaskSchema, MessageSchema, z.object({ append: z.boolean().optional().nullable(), artifact: ArtifactSchema, contextId: z.string(), kind: z.literal("artifact-update"), lastChunk: z.boolean().optional().nullable(), metadata: z.record(z.any()).optional().nullable(), taskId: z.string() }), z.object({ contextId: z.string(), final: z.boolean(), kind: z.literal("status-update"), metadata: z.record(z.any()).optional().nullable(), status: TaskStatusSchema, taskId: z.string() })]) });

export const GetTaskSuccessResponseSchema = BaseRPC.extend({ result: TaskSchema });
export const CancelTaskSuccessResponseSchema = BaseRPC.extend({ result: TaskSchema });
export const SetTaskPushNotificationConfigSuccessResponseSchema = BaseRPC.extend({ result: z.object({ pushNotificationConfig: z.object({ authentication: z.object({ credentials: z.string().optional().nullable(), schemes: z.array(z.string()) }), token: z.string().optional().nullable(), url: z.string() }), taskId: z.string() }) });
export const GetTaskPushNotificationConfigSuccessResponseSchema = BaseRPC.extend({ result: z.object({ pushNotificationConfig: z.object({ authentication: z.object({ credentials: z.string().optional().nullable(), schemes: z.array(z.string()) }).optional().nullable(), token: z.string().optional().nullable(), url: z.string() }), taskId: z.string() }) });

// Error Response
export const JSONRPCErrorResponseSchema = BaseRPC.extend({
  error: z.union([
    JSONRPCErrorSchema,
    JSONParseErrorSchema,
    InvalidRequestErrorSchema,
    MethodNotFoundErrorSchema,
    InvalidParamsErrorSchema,
    InternalErrorSchema,
    TaskNotFoundErrorSchema,
    TaskNotCancelableErrorSchema,
    PushNotificationNotSupportedErrorSchema,
    UnsupportedOperationErrorSchema,
    ContentTypeNotSupportedErrorSchema,
    InvalidAgentResponseErrorSchema,
  ])
});

// Wrappers for RootModel responses
export const SendMessageResponseSchema = z.object({ root: z.union([JSONRPCErrorResponseSchema, SendMessageSuccessResponseSchema]) });
export const SendStreamingMessageResponseSchema = z.object({
  root: z.union([JSONRPCErrorResponseSchema,
    SendStreamingMessageSuccessResponseSchema])
});
export const GetTaskResponseSchema = z.object({ root: z.union([JSONRPCErrorResponseSchema, GetTaskSuccessResponseSchema]) });
export const CancelTaskResponseSchema = z.object({ root: z.union([JSONRPCErrorResponseSchema, CancelTaskSuccessResponseSchema]) });
export const SetTaskPushNotificationConfigResponseSchema = z.object({ root: z.union([JSONRPCErrorResponseSchema, SetTaskPushNotificationConfigSuccessResponseSchema]) });
export const GetTaskPushNotificationConfigResponseSchema = z.object({ root: z.union([JSONRPCErrorResponseSchema, GetTaskPushNotificationConfigSuccessResponseSchema]) });

export const JSONRPCResponseSchema = z.object({
  root: z.union([
    JSONRPCErrorResponseSchema,
    SendMessageSuccessResponseSchema,
    SendStreamingMessageSuccessResponseSchema,
    GetTaskSuccessResponseSchema,
    CancelTaskSuccessResponseSchema,
    SetTaskPushNotificationConfigSuccessResponseSchema,
    GetTaskPushNotificationConfigSuccessResponseSchema,
  ])
});

// AgentCard
export const AgentCapabilitiesSchema = z.object({
  pushNotifications: z.boolean().optional().nullable(),
  stateTransitionHistory: z.boolean().optional().nullable(),
  streaming: z.boolean().optional().nullable(),
});

export const AgentProviderSchema = z.object({
  organization: z.string(),
  url: z.string(),
});

export const AgentSkillSchema = z.object({
  description: z.string(),
  examples: z.array(z.string()).optional().nullable(),
  id: z.string(),
  inputModes: z.array(z.string()).optional().nullable(),
  name: z.string(),
  outputModes: z.array(z.string()).optional().nullable(),
  tags: z.array(z.string()),
});

export const AgentCardSchema = z.object({
  capabilities: AgentCapabilitiesSchema,
  defaultInputModes: z.array(z.string()),
  defaultOutputModes: z.array(z.string()),
  description: z.string(),
  documentationUrl: z.string().optional().nullable(),
  name: z.string(),
  provider: AgentProviderSchema.optional().nullable(),
  security: z
    .array(z.record(z.array(z.string())))
    .optional()
    .nullable(),
  securitySchemes: z
    .record(SecuritySchemeUnion)
    .optional()
    .nullable(),
  skills: z.array(AgentSkillSchema),
  supportsAuthenticatedExtendedCard: z.boolean().optional().nullable(),
  url: z.string(),
  version: z.string(),
});

// Types
export type AgentCard = z.infer<typeof AgentCardSchema>;
export type AgentCapabilities = z.infer<typeof AgentCapabilitiesSchema>;
export type AgentProvider = z.infer<typeof AgentProviderSchema>;
export type AgentSkill = z.infer<typeof AgentSkillSchema>;
export type SecurityScheme = z.infer<typeof SecuritySchemeUnion>;
