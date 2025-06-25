"use client";

import { gravatarUrl } from "@/utils/gravatarUtils";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import ChatContainer from "../_components/chat/ChatContainer";
import { useChat } from "../ChatProvider";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { handleSubmitMessage, messageEvents, runs } = useChat();

  useEffect(() => {
    console.log("Run:", runs);
  }, [runs]);

  useEffect(() => {
    console.log("Events:", messageEvents);
  }, [messageEvents]);

  return (
    <ChatContainer>
      <ChatContainer.Stream>
        {runs.map((run) => (
          <ChatContainer.Run key={run.id} {...run} avatarUrl={gravatarUrl} />
        ))}
      </ChatContainer.Stream>
      <ChatContainer.Input threadId={id} onSubmit={handleSubmitMessage} />
    </ChatContainer>
  );
};

export default ChatPage;
