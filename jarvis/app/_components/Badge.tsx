import { iconSizeMap } from "@/utils/iconUtils";
import { LucideIcon } from "lucide-react";
import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  icon?: LucideIcon;
  label?: string;
  className?: string;
  type?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "neutral"
    | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  outline?: boolean;
  color?: string;
}>;

const typeMap: Record<string, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  success: "badge-success",
  error: "badge-error",
  warning: "badge-warning",
  info: "badge-info",
  neutral: "badge-neutral",
  ghost: "badge-ghost",
};

const sizeMap: Record<string, string> = {
  xs: "badge-xs",
  sm: "badge-sm",
  md: "badge-md",
  lg: "badge-lg",
  xl: "badge-xl",
};

const Badge = ({
  children,
  icon,
  label,
  className,
  type,
  size,
  outline,
  color,
}: Props) => {
  const baseClassName = ["badge"];

  if (outline) baseClassName.push("badge-outline");
  if (type) baseClassName.push(typeMap[type]);
  if (size) baseClassName.push(sizeMap[size]);

  const uniqueClassName = [
    ...new Set([...baseClassName, ...(className?.split(" ") ?? [])]),
  ];
  return (
    <div
      className={uniqueClassName.join(" ")}
      style={
        color ? ({ "--badge-color": color } as React.CSSProperties) : undefined
      }
    >
      {icon && React.createElement(icon, { size: iconSizeMap[size ?? 'md'] })}{label || children}
    </div>
  );
};

export default Badge;