import { Bot, BotMessageSquare, Check, User, Wrench } from "lucide-react";
import { PropsWithChildren } from "react";
import SafeImage from "../SafeImage";
import Spinner from "../Spinner";
import Badge from "../Badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface ToolCall {
  id: string;
  name: string;
  state: "pending" | "completed" | "failed";
  arguments?: string;
}

type BaseProps = {
  avatarUrl?: string;
  content?: string;
  toolCalls?: ToolCall[];
};

type Role = "user" | "assistant" | "system" | "developer" | "tool";

export type MessageProps = BaseProps & {
  role: Role;
};

const Message: React.FC<MessageProps> = ({
  avatarUrl,
  content,
  role,
  toolCalls,
}: MessageProps) => {
  return role === "user" ? (
    <UserMessage content={content} avatarUrl={avatarUrl} />
  ) : role === "assistant" ? (
    <AssistantMessage content={content} toolCalls={toolCalls} />
  ) : null;
};

const UserMessage = ({ avatarUrl, content }: BaseProps) => {
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

const AssistantMessage = ({ content, toolCalls }: BaseProps) => {
  return (
    <div className="chat chat-start">
      <div className="w-10 rounded-full border-2 border-primary h-10">
        <IconWrapper>
          <Bot />
        </IconWrapper>
      </div>
      <div>
        {toolCalls && toolCalls.length > 0 && (
          <>
            {toolCalls.every((toolCall) => toolCall.state !== "pending") ? (
              <div className="text-xs font-semibold">Tool calls completed.</div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold">Calling tools</div>
                <Spinner className="text-primary" />
              </div>
            )}
            <div className="flex flex-col gap-2 mt-2">
              {toolCalls.map((toolCall) => (
                <Badge key={toolCall.id} icon={toolCall.name === "callAgent" ? BotMessageSquare : Wrench} type="primary">
                  {toolCall.name}
                  {toolCall.name === "callAgent" && <span>({toolCall.arguments || "Unknown"})</span>}
                  {toolCall.state === "pending" ? (
                    <Spinner spinner="dots" spinnerSize="xs" />
                  ) : (
                    <Check className="text-success" />
                  )}
                </Badge>
              ))}
            </div>
          </>
        )}
        {content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        ) : toolCalls ? null : (
          <Spinner className="text-primary" />
        )}
      </div>
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
