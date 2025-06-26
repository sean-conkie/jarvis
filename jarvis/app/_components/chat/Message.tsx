import type { Message } from "@ag-ui/core";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SafeImage from "../SafeImage";
import { IconWrapper } from "./IconWrapper";

export interface ToolCall {
  id: string;
  name: string;
  state: "pending" | "completed" | "failed";
  arguments?: string;
}

type BaseProps = {
  avatarUrl?: string;
};

export type MessageProps = BaseProps & {
  id: string;
  role: "assistant" | "user" | "tool" | "system" | "developer";
  name?: string | undefined;
  content?: string | undefined;
  toolCalls?:
    | {
        function: {
          name: string;
          arguments: string;
        };
        type: "function";
        id: string;
      }[]
    | undefined;
};

const Message: React.FC<MessageProps> = (props: MessageProps) => {
  return props.role === "user" ? (
    <UserMessage {...props} />
  ) : props.role === "assistant" ? (
    <AssistantMessage {...props} />
  ) : null;
};

const UserMessage = ({ avatarUrl, content }: MessageProps) => {
  return (
    <div className="chat chat-end">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {avatarUrl ? (
            <SafeImage
              src={avatarUrl}
              alt="User avatar"
              width={20}
              height={20}
            />
          ) : (
            <IconWrapper>
              <User />
            </IconWrapper>
          )}
        </div>
      </div>
      <div className="chat-bubble">{content}</div>
    </div>
  );
};

const AssistantMessage = ({ content }: MessageProps) => {
  return (
    <div className="chat chat-start">
      <div className="w-10 rounded-full border-2 border-primary h-10">
        <IconWrapper>
          <Bot />
        </IconWrapper>
      </div>
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || ""}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
