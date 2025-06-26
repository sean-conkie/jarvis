import { PropsWithChildren } from "react";

export const IconWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {children}
    </div>
  );
};
