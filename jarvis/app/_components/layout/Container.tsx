import { PropsWithChildren } from "react";

/**
 * A flexible container component that arranges its children in a column layout with spacing.
 *
 * @param props.children - The content to be rendered inside the container.
 * @param props.className - Optional additional CSS class names to apply to the container.
 *
 * The container uses Tailwind CSS classes for layout:
 * - `flex flex-col gap-2`: Arranges children in a vertical column with spacing.
 * - `h-full w-full`: Makes the container take full height and width.
 * - `overflow-y-scroll`: Enables vertical scrolling if content overflows.
 */
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
