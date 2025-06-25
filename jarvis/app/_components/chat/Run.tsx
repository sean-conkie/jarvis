import { ChatRun } from "@/app/ChatProvider";
import React from "react";
import ChatContainer from "./ChatContainer";

export type RunProps = ChatRun & {
  avatarUrl?: string;
};

const Run: React.FC<RunProps> = ({
  agentMessages,
  avatarUrl,
  state,
  toolCalls,
  userMessage,
}: RunProps) => {
  return (
    <div>
      <ChatContainer.Message
        key={userMessage.id}
        {...userMessage}
        avatarUrl={avatarUrl}
      />
      <ChatContainer.Reponse
        agentMessages={agentMessages}
        state={state}
        toolCalls={toolCalls}
      />
    </div>
  );
};

export default Run;
