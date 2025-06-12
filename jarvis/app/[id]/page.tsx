"use client";

import { useParams } from "next/navigation";
import ChatContainer from "../_components/chat/ChatContainer";
import { useChat } from "../ChatProvider";
import { useEffect } from "react";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { handleSubmitMessage, messageEvents, messages } = useChat();

  useEffect(() => {
    console.log(messageEvents);
  }, [messageEvents]);

  return (
    <ChatContainer>
      <ChatContainer.Stream>
        {/* The Stream component can be used to display messages or chat history */}
        {messages.map((message) => (
          <div key={message.id} className="border-2 border-amber-300 rounded-md m-2 p-2">
            {message.content}
          </div>
        ))}
      </ChatContainer.Stream>
      <ChatContainer.Input threadId={id} onSubmit={handleSubmitMessage} />
    </ChatContainer>
  );
};

export default ChatPage;
