"use client";

import { backendAxiosInstance } from "@/utils/backendUtils";
import { newStream } from "@/utils/streamUtils";
import { EventSchemas, EventType, Message, RunAgentInput } from "@ag-ui/core";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import z from "zod";

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
  const messagesRef = React.useRef<Message[]>(messages);

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
        tools: [], // Assuming no tools are used for now
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

          // if the event is message start, set the messageId
          if (validated.data.type === EventType.TEXT_MESSAGE_START) {
            // If the event is a message start, create a new message object
            const newEventMessage: Message = {
              id: validated.data.messageId || uuidv4(),
              content: "",
              role: validated.data.role || "assistant",
            };
            // Add the new message to the messages state
            setMessages((prevMessages) => [...prevMessages, newEventMessage]);
          } else if (validated.data.type === EventType.TEXT_MESSAGE_CONTENT) {
            // If the event is a message content, append it to the existing message
            const messageId = validated.data.messageId;
            const content = validated.data.delta;
            if (messageId) {
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
            }
          } else if (validated.data.type === EventType.RUN_ERROR) {
            // If the event is a run error, log the error and close the event source
            console.error("Run error:", validated.data.message);
            eventSource.close();
            return;
          }

          setMessageEvents((prevEvents) => [...prevEvents, validated.data]);

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
    []
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
