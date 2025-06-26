import React from "react";

export type SkeletonProps = {
  height?: string;
  width?: string;
  className?: string;
};

const Skeleton = ({ className, height, width }: SkeletonProps) => {
  const classNames = ["skeleton", className].filter(Boolean);
  const style: React.CSSProperties = {};
  if (height) {
    style.height = height;
  } else {
    classNames.push("h-full min-h-4");
  }

  if (width) {
    style.width = width;
  } else {
    classNames.push("w-full min-w-16");
  }

  return <div className={classNames.join(" ")} style={style}></div>;
};

export default Skeleton;