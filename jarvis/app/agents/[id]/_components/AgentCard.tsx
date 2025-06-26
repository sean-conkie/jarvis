import Card from "@/app/_components/layout/Card";
import { PropsWithChildren } from "react";

/**
 * Renders a card component with a title and optional children content.
 *
 * @param props - The props for the AgentCard component.
 * @param props.title - The title displayed at the top of the card.
 * @param props.children - The content to be rendered inside the card.
 *
 * @returns A styled card component containing the provided title and children.
 */
const AgentCard = ({
  children,
  title,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <Card className="bg-base-100 shadow-sm h-fit">
      <Card.Title>{title}</Card.Title>
      {children}
    </Card>
  );
};

export default AgentCard;
