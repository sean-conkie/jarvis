"use client";

import { useParams } from "next/navigation";
import ChatContainer from "../_components/chat/ChatContainer";
import { useChat } from "../ChatProvider";
import { useEffect, useState } from "react";
import { gravatarUrl } from "@/utils/gravatarUtils";
import { ToolCall } from "../_components/chat/Message";

type SimpleMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  toolCalls?: ToolCall[];
};

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { handleSubmitMessage, messageEvents, messages } = useChat();

  // state to handle updated message objects
  const [transformedMessages, setTransformedMessages] = useState<
    SimpleMessage[]
  >([]);

  // Transform messages to a simpler structure
  useEffect(() => {
    // map all user and assistant messages to a simpler structure
    const newMessages = messages
      .map((message) => {
        if (["user", "assistant"].includes(message.role) === false) {
          return null;
        }
        return {
          id: message.id,
          role: message.role,
          content: message.content,
          toolCalls:
            "toolCalls" in message
              ? (message.toolCalls || []).map((tc) => {
                  return {
                    id: tc.id,
                    name: tc.function.name,
                    state: "pending",
                  };
                })
              : undefined,
        };
      })
      .filter(Boolean) as SimpleMessage[];

    // update the state of tool calls if there is a related tool response
    messages.forEach((message) => {
      if (message.role === "tool") {
        // find the tool call in the transformed messages
        newMessages.forEach((msg) => {
          if (msg.toolCalls) {
            const toolCall = msg.toolCalls.find(
              (tc) => tc.id === message.toolCallId
            );
            if (toolCall) {
              // update the state of the tool call
              toolCall.state = "completed";
            }
          }
        });
      }
    });

    // set the transformed messages state
    setTransformedMessages(newMessages);
  }, [messages]);

  useEffect(() => {
    console.log(messageEvents);
  }, [messageEvents]);

  return (
    <ChatContainer>
      <ChatContainer.Stream>
        {/* The Stream component can be used to display messages or chat history */}
        {transformedMessages.map((message) => (
          <ChatContainer.Message
            key={message.id}
            {...message}
            avatarUrl={gravatarUrl}
          />
        ))}
      </ChatContainer.Stream>
      <ChatContainer.Input threadId={id} onSubmit={handleSubmitMessage} />
    </ChatContainer>
  );
};

export default ChatPage;
