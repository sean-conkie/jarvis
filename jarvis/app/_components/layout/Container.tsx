import { PropsWithChildren } from "react";

const Container = ({ children, className }: PropsWithChildren<{className?: string}>) => {

  // Apply additional className if provided
  const containerClasses = ["flex flex-col gap-2 h-full w-full overflow-y-scroll", className].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default Container;
