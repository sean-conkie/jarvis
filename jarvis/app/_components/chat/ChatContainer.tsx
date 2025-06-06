import { PropsWithChildren } from "react";

type BaseProps = PropsWithChildren;

type ChatContainerComponent = React.FC<BaseProps> & {
  Input: React.FC;
  Stream: React.FC<BaseProps>;
};

const ChatContainer: ChatContainerComponent = ({ children }: BaseProps) => {
  return (
    <div className="flex flex-col gap-2 h-full w-full overflow-y-scroll items-baseline">
      {children}
    </div>
  );
};

const Input: React.FC = () => {
  return (
    <div className="flex items-center p-4 w-full rounded-md bg-white">
      <input
        type="text"
        placeholder="Type your message..."
        className="flex-grow p-2 border rounded"
      />
      <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
        Send
      </button>
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
