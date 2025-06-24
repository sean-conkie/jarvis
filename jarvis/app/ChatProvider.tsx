"use client";

import { backendAxiosInstance } from "@/utils/backendUtils";
import { newStream } from "@/utils/streamUtils";
import {
  EventSchemas,
  EventType,
  Message,
  RunAgentInput,
  TextMessageStartEvent,
  ToolCall,
  ToolCallArgsEvent,
  ToolCallEndEvent,
} from "@ag-ui/core";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import { ThemeArgs, useTheme } from "./_components/theme/ThemeProvider";
import { flushSync } from "react-dom";

interface ChatContextValue {
  threadId: string | null;
  createNewChat: () => string;
  messages: Message[];
  messageEvents: Event[];
  handleSubmitMessage: (message: string, threadId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const RunIdResponseSchema = z.object({
  runId: z.string(),
});

type RunIdResponse = z.infer<typeof RunIdResponseSchema>;

type Event = z.infer<typeof EventSchemas>;

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  // manage the theme tool state
  const { themeTool } = useTheme();
  const themeToolRef = React.useRef(themeTool);

  // Update the ref whenever the theme tool changes
  useEffect(() => {
    themeToolRef.current = themeTool;
  }, [themeTool]);

  // State to hold the current thread ID
  const [threadId, setThreadId] = useState<string | null>(null);

  // Memoizes an object containing the current thread ID.
  const threadIdValue = useMemo(() => {
    return { threadId };
  }, [threadId]);

  // Function to create a new chat thread
  const createNewChat = useCallback((): string => {
    const newId = uuidv4();
    setThreadId(newId);
    return newId;
  }, []);

  // State to hold messages
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>(messages);

  // Memoizes an object containing the current messages.
  const messagesValue = useMemo(() => {
    return { messages };
  }, [messages]);

  // Update the messagesRef whenever messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // State to hold message events
  const [messageEvents, setMessageEvents] = useState<Event[]>([]);

  // Memoizes an object containing the current message events.
  const messageEventsValue = useMemo(() => {
    return { messageEvents };
  }, [messageEvents]);

  // map toolCallId to messageId
  const toolCallMapRef = useRef<Record<string, string>>({});

  // callback to get message from toolCallId
  const getMessageFromToolCallId = useCallback(
    (toolCallId: string): Message | undefined => {
      const messageId = toolCallMapRef.current[toolCallId];
      if (!messageId) {
        console.error(`Message ID not found for tool call ID: ${toolCallId}`);
        return undefined;
      }
      return messagesRef.current.find((msg) => msg.id === messageId);
    },
    []
  );

  // callback to get tool call from message, using toolCallId
  const getToolCall = useCallback(
    (toolCallId: string): ToolCall | undefined => {
      const message = getMessageFromToolCallId(toolCallId);
      if (!message) {
        console.error(`Message not found for tool call ID: ${toolCallId}`);
        return undefined;
      }

      if (!("toolCalls" in message)) {
        return undefined;
      }

      if (!message.toolCalls) {
        return undefined;
      }
      return message.toolCalls.find((tc) => tc.id === toolCallId);
    },
    [getMessageFromToolCallId]
  );

  // Handle submitting a message
  const handleSubmitMessage = useCallback(
    async (message: string, threadId: string) => {
      if (!threadId) {
        throw new Error("Thread ID is not defined.");
      }

      // Create a new message object
      const newMessage: Message = {
        id: uuidv4(),
        content: message,
        role: "user",
      };

      // Create agent input
      const agentInput: RunAgentInput = {
        threadId,
        runId: uuidv4(),
        state: {}, // Assuming state is an empty object for now
        messages: [...messagesRef.current, newMessage],
        tools: [
          {
            name: themeToolRef.current.name,
            description: themeToolRef.current.description,
            parameters: themeToolRef.current.parameters,
          },
        ], // Assuming no tools are used for now
        context: [], // Assuming no context is provided for now
        forwardedProps: "", // Assuming no forwarded props for now
      };

      // Update the messages state
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Submit the message
      try {
        // 1. Trigger the process via POST (using fetch or axios)
        const res = await backendAxiosInstance.post<RunIdResponse>(
          "/chat/start",
          agentInput
        );

        const validated = RunIdResponseSchema.safeParse(res.data);
        if (!validated.success) {
          console.error("Validation failed:", validated.error.errors);
          return;
        }

        const { runId } = validated.data;

        // 2. Subscribe to the SSE stream
        const eventSource = newStream(`/chat/stream/${runId}`);

        eventSource.onmessage = async (event) => {
          const validated = EventSchemas.safeParse(JSON.parse(event.data));
          if (!validated.success) {
            console.error("Validation failed:", validated.error.errors);
            eventSource.close();
            return;
          }

          setMessageEvents((prevEvents) => [...prevEvents, validated.data]);

          // if the event is message start, set the messageId
          if (validated.data.type === EventType.TEXT_MESSAGE_START) {
            // Remove the placeholder message if it exists in messages
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== "placeholder")
            );

            // remove the placeholder message from the messagesRef
            messagesRef.current = messagesRef.current.filter(
              (msg) => msg.id !== "placeholder"
            );

            const message = validated.data as TextMessageStartEvent;

            // if the message already exists, do not create a new one
            const existingMessage = messagesRef.current.find(
              (msg) => msg.id === message.messageId
            );

            if (existingMessage) {
              // If the message already exists, just return
              return;
            }

            // If the event is a message start, create a new message object
            const newEventMessage: Message = {
              id: message.messageId || uuidv4(),
              content: "",
              role: message.role || "assistant",
              toolCalls: [],
            };

            // Add the new message to the messagesRef
            messagesRef.current = [...messagesRef.current, newEventMessage];

            // Add the new message to the messages state
            flushSync(() => {
              setMessages((prevMessages) => [...prevMessages, newEventMessage]);
            });
          } else if (validated.data.type === EventType.TOOL_CALL_START) {
            // Remove the placeholder message if it exists in messages
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== "placeholder")
            );
            // remove the placeholder message from the messagesRef
            messagesRef.current = messagesRef.current.filter(
              (msg) => msg.id !== "placeholder"
            );

            // is there a parentMessageId?
            const parentMessageId = validated.data.parentMessageId || uuidv4();
            let parentMessage: Message | undefined = messagesRef.current.find(
              (msg) => msg.id === parentMessageId
            );

            if (parentMessage === undefined) {
              // create a new parent message if it doesn't exist
              const newParentMessage: Message = {
                id: parentMessageId,
                content: undefined,
                role: "assistant",
                toolCalls: [],
              };

              // Add the new parent message to the messagesRef
              messagesRef.current = [...messagesRef.current, newParentMessage];

              // Add the new parent message to the messages state
              flushSync(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  newParentMessage,
                ]);
              });
              parentMessage = newParentMessage;
            }

            if (!("toolCalls" in parentMessage)) {
              parentMessage = {
                ...parentMessage,
                role: "assistant",
                toolCalls: [] as ToolCall[],
              };
            }

            // create the tool call
            const toolCall: ToolCall = {
              id: validated.data.toolCallId || uuidv4(),
              type: "function",
              function: {
                name: validated.data.toolCallName,
                arguments: "",
              },
            };

            // Add the tool call to the parent message's toolCalls array
            parentMessage.toolCalls!.push(toolCall);

            // Update the toolCallId to messageId map
            toolCallMapRef.current[validated.data.toolCallId] =
              parentMessage.id;

            // Update the messagesRef with the new parent message
            messagesRef.current = messagesRef.current.map((msg) =>
              msg.id === parentMessageId ? parentMessage : msg
            );

            // Update the messages state with the new parent message
            flushSync(() => {
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === parentMessageId ? parentMessage : msg
                )
              );
            });
          } else if (validated.data.type === EventType.TEXT_MESSAGE_CONTENT) {
            // If the event is a message content, append it to the existing message
            const messageId = validated.data.messageId;
            const content = validated.data.delta;
            if (messageId) {
              flushSync(() => {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          content: content,
                        }
                      : msg
                  )
                );
              });
            }
          } else if (validated.data.type === EventType.TOOL_CALL_ARGS) {
            const toolCallArgs = validated.data as ToolCallArgsEvent;
            const message = getMessageFromToolCallId(toolCallArgs.toolCallId);
            const toolCall = getToolCall(toolCallArgs.toolCallId);

            if (!message) {
              // If the message is not found, log an error and return
              console.error(
                `Message not found for tool call ID: ${toolCallArgs.toolCallId}`
              );
              return;
            }

            // If the tool call is not found, log an error and return
            if (!toolCall) {
              console.error(
                `Tool call not found for tool call ID: ${toolCallArgs.toolCallId}`
              );
              return;
            }

            if (toolCall && message && "toolCalls" in message) {
              toolCall.function.arguments = toolCallArgs.delta;

              // Update the tool call in the message's toolCalls array
              message.toolCalls = message.toolCalls!.map((tc) =>
                tc.id === toolCall.id ? toolCall : tc
              );

              // update the message ref with the updated message
              messagesRef.current = messagesRef.current.map((msg) =>
                msg.id === message.id ? message : msg
              );

              // Update the tool call in the message's toolCalls array
              flushSync(() => {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === message.id ? message : msg
                  )
                );
              });
            }
          } else if (validated.data.type === EventType.TOOL_CALL_END) {
            // run the tool call and add the response to the messages
            const toolCallEnd = validated.data as ToolCallEndEvent;
            const toolCall = getToolCall(toolCallEnd.toolCallId);

            if (toolCall) {
              // Assuming the tool call response is in toolCallEnd.result
              let toolCallArgs: Record<string, unknown> | undefined = undefined;
              try {
                toolCallArgs = JSON.parse(toolCall.function.arguments);
              } catch (error) {
                console.debug("Failed to parse tool call arguments:", error);
                toolCallArgs = {}
              }
              
              let result: string | undefined = undefined;
              if (toolCall.function.name === "setTheme") {
                if (toolCallArgs) {
                  result = JSON.stringify(await themeToolRef.current.invoke(toolCallArgs as unknown as ThemeArgs));
                } else {
                  console.error("Tool call arguments are undefined or invalid.");
                }
              }

              const toolResultMessage: Message = {
                id: uuidv4(),
                toolCallId: toolCall.id,
                content: result || "",
                role: "tool",
              };

              flushSync(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  toolResultMessage,
                ]);
              });
            }
          } else if (validated.data.type === EventType.TEXT_MESSAGE_END) {
            // Remove the placeholder message if it exists in messages
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== "placeholder")
            );
          } else if (validated.data.type === EventType.RUN_ERROR) {
            // If the event is a run error, log the error and close the event source
            console.error("Run error:", validated.data.message);
            eventSource.close();
            return;
          } else if (validated.data.type === EventType.RUN_STARTED) {
            // Add a placeholer message for the run started event
            const runStartedMessage: Message = {
              id: "placeholder",
              content: undefined,
              role: "assistant",
            };

            // Add the run started message to the messagesRef
            messagesRef.current = [...messagesRef.current, runStartedMessage];
            // Add the run started message to the messages state
            flushSync(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                runStartedMessage,
              ]);
            });
          }

          if (validated.data.type === EventType.RUN_FINISHED) {
            // If the run is finished, close the event source
            eventSource.close();
          }
        };

        eventSource.onerror = (err) => {
          console.error("EventSource failed:", err);
          eventSource.close();
        };
      } catch {
        console.error("Something went wrong with chat 😔");
      }
    },
    [getMessageFromToolCallId, getToolCall]
  );

  return (
    <ChatContext.Provider
      value={{
        ...threadIdValue,
        createNewChat,
        ...messagesValue,
        ...messageEventsValue,
        handleSubmitMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
