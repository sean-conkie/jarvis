import { PropsWithChildren } from "react";

/**
 * A layout component that wraps its children in a styled div.
 *
 * @param children - The content to be rendered inside the layout container.
 * @returns The wrapped children within a styled container.
 */
const Content = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col w-full p-4 rounded-md grow bg-base-100 gap-4">
      {children}
    </div>
  );
};

export default Content;
