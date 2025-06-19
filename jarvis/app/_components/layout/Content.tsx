import { PropsWithChildren } from "react";

const Content = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col w-full p-4 rounded-md grow bg-base-100 gap-4">
      {children}
    </div>
  );
};

export default Content;
