import Card from "../layout/Card";
import { CardProps } from "./base";

/**
 * Renders a UI Kit Card component with an optional title and custom content.
 *
 * @param {CardProps} props - The properties for the UIKitCard component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {string} [props.className] - Optional additional CSS class names to apply to the card.
 * @param {string} [props.title] - Optional title to display at the top of the card.
 * @returns {JSX.Element} The rendered Card component.
 */
const UIKitCard = ({ children, className, title }: CardProps) => {
  return (
    <Card className={className}>
      {title && <Card.Title>{title}</Card.Title>}
      {children}
    </Card>
  );
};

export default UIKitCard;
