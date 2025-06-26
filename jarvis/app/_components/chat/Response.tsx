import { ChatRunToolCall } from "@/app/ChatProvider";
import { EventType, Message } from "@ag-ui/core";
import { Bot, BotMessageSquare, Check, Hourglass, Wrench } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconWrapper } from "./IconWrapper";
import Running from "./RunState";
import Badge from "../Badge";
import Spinner from "../Spinner";

export type ResponseProps = {
  agentMessages: Message[];
  state: EventType.RUN_STARTED | EventType.RUN_ERROR | EventType.RUN_FINISHED;
  toolCalls?: ChatRunToolCall[];
};

const Response: React.FC<ResponseProps> = ({
  agentMessages,
  state,
  toolCalls,
}: ResponseProps) => {
  return (
    <div className="chat chat-start">
      <div className="w-10 rounded-full border-2 border-primary h-10">
        <IconWrapper>
          <Bot />
        </IconWrapper>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          {toolCalls?.map((toolCall) => (
            <Badge
              key={toolCall.id}
              icon={toolCall.name === "callAgent" ? BotMessageSquare : Wrench}
              type="primary"
            >
              {toolCall.name}
              {toolCall.name === "callAgent" && (
                <span>({toolCall.arguments || "Unknown"})</span>
              )}
              {toolCall.state === EventType.TOOL_CALL_START ? (
                <Hourglass size={16} /> ) : (toolCall.state === EventType.TOOL_CALL_ARGS ? (
                <Spinner spinner="dots" spinnerSize="xs" />
              ) : (
                <Check className="text-success" />
              ))}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {agentMessages.map((message) => {
            if (message.role !== "assistant") {
              return null;
            }
            return (
              <ReactMarkdown key={message.id} remarkPlugins={[remarkGfm]}>
                {message.content || ""}
              </ReactMarkdown>
            );
          })}
        </div>
        {state === EventType.RUN_STARTED && <Running />}
      </div>
    </div>
  );
};

export default Response;
