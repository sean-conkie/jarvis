// "use client";

import React, { PropsWithChildren } from "react";
import { Input, InputProps } from "./Input";
import Message, { MessageProps } from "./Message";
import Content from "../layout/Content";
import Container from "../layout/Container";

type BaseProps = PropsWithChildren;

type ChatContainerComponent = React.FC<BaseProps> & {
  Input: React.FC<InputProps>;
  Message: React.FC<MessageProps>;
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
ChatContainer.Stream = Stream;

export default ChatContainer;
