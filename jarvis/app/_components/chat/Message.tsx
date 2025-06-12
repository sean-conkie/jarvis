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
    <div className="flex items-center justify-end w-full">
      <div className="bg-blue-500 text-white p-2 rounded-lg  max-w-96">{content}</div>
    </div>
  );
};

const AssistantMessage = ({ content }: BaseProps) => {
  return (
    <div className="flex items-center justify-start w-full">{content}</div>
  );
};

export default Message;
