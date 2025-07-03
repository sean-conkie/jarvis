import React from "react";
import { UIKitElement } from "./base";
import Card from "./Card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function renderNode(node: UIKitElement | string): React.ReactNode {
  if (typeof node === "string") {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {node || ""}
            </ReactMarkdown>; // Return string directly
  }

  const { type, props = {}, children = [] } = node;
  const childEls = Array.isArray(children)
    ? children.map((c) => renderNode(c))
    : typeof children === "undefined" || children === null
      ? undefined
      : renderNode(children);

  if (type === "card") {
    // Special handling for "card" type
    return <Card key={props.key ?? Math.random()} {...props}>{childEls}</Card>
  } else {
    return React.createElement(type, { ...props, key: props.key ?? Math.random() }, childEls);
  }

}

const Node = ({ element }: { element: UIKitElement }) => {
  return <>{renderNode(element)}</>;
};

export default Node;
