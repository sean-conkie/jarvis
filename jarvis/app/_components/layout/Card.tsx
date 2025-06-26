import React, { PropsWithChildren } from "react";

/**
 * Props for a component that accepts children and an optional CSS class name.
 *
 * @property {string} [className] - Optional additional CSS class names to apply to the component.
 * @property {React.ReactNode} children - The content to be rendered inside the component.
 */
type BaseProps = PropsWithChildren<{ className?: string }>;

/**
 * A React functional component type for a Card, which includes a static `Title` subcomponent.
 *
 * @remarks
 * The `CardComponent` type extends `React.FC` with `BaseProps` and adds a `Title` property,
 * which is itself a React functional component that also accepts `BaseProps`.
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Title>Card Title</Card.Title>
 *   Card content goes here.
 * </Card>
 * ```
 */
type CardComponent = React.FC<BaseProps> & {
  Title: React.FC<BaseProps>;
};

/**
 * Renders a styled card component with optional custom class names.
 *
 * @param children - The content to be displayed inside the card body.
 * @param className - Additional CSS class names to apply to the card container.
 * @returns A React element representing the card layout.
 */
const Card: CardComponent = ({ children, className }: BaseProps) => {
  const cardClasses = ["card", className].filter(Boolean).join(" ");
  return (
    <div className={cardClasses}>
      <div className="card-body">{children}</div>
    </div>
  );
};

/**
 * Renders a card title as an <h2> element with customizable classes.
 *
 * @param children - The content to display inside the title.
 * @param className - Additional CSS classes to apply to the title element.
 * @returns The rendered card title component.
 */
const Title: React.FC<BaseProps> = ({ children, className }) => {
  const titleClasses = ["card-title", className].filter(Boolean).join(" ");
  return <h2 className={titleClasses}>{children}</h2>;
};

Card.Title = Title;

export default Card;
