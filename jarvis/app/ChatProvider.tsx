"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";

interface ChatContextValue {
  threadId: string | null;
  createNewChat: () => string;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {

  // State to hold the current thread ID
  const [threadId, setThreadId] = useState<string | null>(null);

  const createNewChat = useCallback((): string => {
    const newId = uuidv4();
    setThreadId(newId);
    return newId;
  }, []);

  return (
    <ChatContext.Provider value={{ threadId, createNewChat }}>
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
