// "use client";

import { PropsWithChildren } from "react";
import { Input, InputProps } from "./Input";

type BaseProps = PropsWithChildren;

type ChatContainerComponent = React.FC<BaseProps> & {
  Input: React.FC<InputProps>;
  Stream: React.FC<BaseProps>;
};

const ChatContainer: ChatContainerComponent = ({ children }: BaseProps) => {
  return (
    <div className="flex flex-col gap-2 h-full w-full overflow-y-scroll items-baseline">
      {children}
    </div>
  );
};

const Stream: React.FC<BaseProps> = ({ children }) => {
  return (
    <div className="flex flex-col w-full p-4 rounded-md grow bg-white">
      {children}
    </div>
  );
};

ChatContainer.Input = Input;
ChatContainer.Stream = Stream;

export default ChatContainer;
