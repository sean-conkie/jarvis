import React, { PropsWithChildren } from "react";

type BaseProps = PropsWithChildren<{ className?: string }>;

type CardComponent = React.FC<BaseProps> & {
  Title: React.FC<BaseProps>;
};

const Card: CardComponent = ({ children, className }: BaseProps) => {
  const cardClasses = ["card", className].filter(Boolean).join(" ");
  return (
    <div className={cardClasses}>
      <div className="card-body">{children}</div>
    </div>
  );
};

const Title: React.FC<BaseProps> = ({ children, className }) => {
  const titleClasses = ["card-title", className].filter(Boolean).join(" ");
  return <h2 className={titleClasses}>{children}</h2>;
};

Card.Title = Title;

export default Card;
