import { iconSizeMap } from "@/utils/iconUtils";
import { LucideIcon } from "lucide-react";
import React, { PropsWithChildren } from "react";

/**
 * Props for the `Badge` component.
 *
 * @property {LucideIcon} [icon] - Optional icon to display in the badge.
 * @property {string} [label] - Optional label text for the badge.
 * @property {string} [className] - Additional CSS classes to apply to the badge.
 * @property {"primary" | "secondary" | "accent" | "success" | "error" | "warning" | "info" | "neutral" | "ghost"} [type] - Visual style of the badge.
 * @property {"xs" | "sm" | "md" | "lg" | "xl"} [size] - Size of the badge.
 * @property {boolean} [outline] - Whether the badge should have an outline style.
 * @property {string} [color] - Custom color for the badge.
 * @property {React.ReactNode} children - Content to be displayed inside the badge.
 */
export type BadgeProps = PropsWithChildren<{
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

/**
 * Renders a customizable badge component that can display an icon, label, or children.
 *
 * @param children - The content to display inside the badge if no label is provided.
 * @param icon - An optional icon component to display at the start of the badge.
 * @param label - An optional string to display as the badge's label.
 * @param className - Additional CSS class names to apply to the badge.
 * @param type - The type of the badge, used to determine its style (e.g., success, warning).
 * @param size - The size of the badge (e.g., sm, md, lg).
 * @param outline - If true, applies an outline style to the badge.
 * @param color - An optional custom color for the badge, applied via CSS variable.
 * @returns A styled badge component with optional icon and label.
 */
const Badge = ({
  children,
  icon,
  label,
  className,
  type,
  size,
  outline,
  color,
}: BadgeProps) => {
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