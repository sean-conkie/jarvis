type BaseProps = {
  content?: string;
};

type Role = "user" | "assistant" | "system" | "developer" | "tool";

export type MessageProps = BaseProps & {
  role: Role;
};

const Message: React.FC<MessageProps> = ({ content, role }: MessageProps) => {
  return role === "user" ? (
    <UserMessage content={content} />
  ) : role === "assistant" ? (
    <AssistantMessage content={content} />
  ) : null;
};

const UserMessage = ({ content }: BaseProps) => {
  return (
    <div className="chat chat-end">
      <div className="chat-bubble">{content}</div>
    </div>
  );
};

const AssistantMessage = ({ content }: BaseProps) => {
  return (
    <div className="flex items-center justify-start w-full">{content}</div>
  );
};

export default Message;
