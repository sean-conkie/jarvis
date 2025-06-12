import { Bot, User } from "lucide-react";
import { PropsWithChildren } from "react";
import SafeImage from "../SafeImage";
import Spinner from "../Spinner";

type BaseProps = {
  content?: string;
  avatarUrl?: string;
};

type Role = "user" | "assistant" | "system" | "developer" | "tool";

export type MessageProps = BaseProps & {
  role: Role;
};

const Message: React.FC<MessageProps> = ({
  avatarUrl,
  content,
  role,
}: MessageProps) => {
  return role === "user" ? (
    <UserMessage content={content} avatarUrl={avatarUrl} />
  ) : role === "assistant" ? (
    <AssistantMessage content={content} />
  ) : null;
};

const UserMessage = ({ avatarUrl, content }: BaseProps) => {
  return (
    <div className="chat chat-end">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          {avatarUrl ? (
            <SafeImage src={avatarUrl} alt="User avatar" width={20} height={20} />
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

const AssistantMessage = ({ content }: BaseProps) => {
  return (
    <div className="chat chat-start">
      <div className="w-10 rounded-full border-2 border-primary h-10">
        <IconWrapper>
          <Bot />
        </IconWrapper>
      </div>
      {content ? content : <Spinner className="text-primary" />}
    </div>
  );
};

const IconWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
};

export default Message;
