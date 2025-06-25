// "use client";

import React, { PropsWithChildren } from "react";
import Container from "../layout/Container";
import Content from "../layout/Content";
import { Input, InputProps } from "./Input";
import Message, { MessageProps } from "./Message";
import Response, { ResponseProps } from "./Response";
import Run, { RunProps } from "./Run";

type BaseProps = PropsWithChildren;

type ChatContainerComponent = React.FC<BaseProps> & {
  Input: React.FC<InputProps>;
  Message: React.FC<MessageProps>;
  Reponse: React.FC<ResponseProps>;
  Run: React.FC<RunProps>;
  Stream: React.FC<BaseProps>;
};

const ChatContainer: ChatContainerComponent = ({ children }: BaseProps) => {
  return <Container className="items-baseline">{children}</Container>;
};

const Stream: React.FC<BaseProps> = ({ children }) => {
  return <Content>{children}</Content>;
};

ChatContainer.Input = Input;
ChatContainer.Message = Message;
ChatContainer.Reponse = Response;
ChatContainer.Run = Run;
ChatContainer.Stream = Stream;

export default ChatContainer;
