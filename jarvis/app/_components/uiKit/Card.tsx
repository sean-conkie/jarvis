import Card from "../layout/Card";
import { CardProps } from "./base";
import {
  borderRadiusMap,
  borderStyleMap,
  shadowMap,
  styleMap,
} from "./propUtils";

/**
 * Renders a UI Kit Card component with an optional title and custom content.
 *
 * @param {CardProps} props - The properties for the UIKitCard component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {string} [props.className] - Optional additional CSS class names to apply to the card.
 * @param {string} [props.title] - Optional title to display at the top of the card.
 * @returns {JSX.Element} The rendered Card component.
 */
const UIKitCard = ({
  border,
  borderRadius,
  children,
  className,
  title,
  shadow,
  style,
}: CardProps) => {
  const classNames = [
    className,
    style ? styleMap[style as keyof typeof styleMap] : "neutral",
    borderRadius
      ? borderRadiusMap[borderRadius as keyof typeof borderRadiusMap]
      : "rounded-md",
    border ? borderStyleMap[border as keyof typeof borderStyleMap] + ' border-1' : "solid",
    shadow ? shadowMap[shadow as keyof typeof shadowMap] : "md",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card className={classNames}>
      {title && <Card.Title>{title}</Card.Title>}
      {children}
    </Card>
  );
};

export default UIKitCard;
