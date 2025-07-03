/**
 * Props shared by base UI components.
 *
 * @property className - Optional CSS class name(s) to apply to the component.
 */
export type BaseProps = {
  className?: string;
  key?: string | number;
};

/**
 * Props for the Card component.
 *
 * @typeParam PropsWithChildren - Extends the props to include React children.
 * @property [key] - Optional unique identifier for the card, can be a string or number.
 * @property [title] - Optional title to display on the card.
 * @property [style] - Visual style of the card. Can be one of:
 *   - "primary"
 *   - "secondary"
 *   - "success"
 *   - "danger"
 *   - "warning"
 *   - "info"
 *   - "neutral"
 * @property [border] - Border radius of the card. Can be one of:
 *   - "none"
 *   - "sm"
 *   - "md"
 *   - "lg"
 *   - "xl"
 *   - "2xl"
 *   - "3xl"
 *   - "4xl"
 *   - "full"
 * @property [shadow] - Shadow size of the card. Can be one of:
 *   - "2xs"
 *   - "xs"
 *   - "sm"
 *   - "md"
 *   - "lg"
 *   - "xl"
 *   - "2xl"
 *   - "none"
 */
export type CardProps = PropsWithChildren<
  {
    key?: string | number;
    title?: string;
    style?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "neutral";
    border?: "solid" | "dashed" | "dotted" | "double" | "none";
    borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
    shadow?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "none";
  }
>;

/**
 * Represents a set of common HTML tag names that can be used for rendering elements.
 * 
 * @remarks
 * This type is useful for restricting component props to a specific subset of HTML tags.
 * 
 * @example
 * ```typescript
 * function MyComponent({ as }: { as: HtmlTag }) {
 *   return React.createElement(as, null, "Content");
 * }
 * ```
 */
export type HtmlTag = "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Represents a UI element that can be either a custom "card" component or a standard HTML tag.
 *
 * - If `type` is `"card"`, the element uses optional `CardProps` and has children that are either a string or another `Element`, or null.
 * - If `type` is an `HtmlTag`, the element uses optional `Props` and has children that are an array of strings or `Element`, or null.
 */
export type UIKitElement =
  | { type: "card"; props?: CardProps | null; children: (string | UIKitElement) | null }
  | { type: HtmlTag; props?: Props | null; children?: (string | UIKitElement)[] | null };

/**
 * Represents a response containing an array of elements.
 *
 * @property elements - An array of `Element` objects included in the response.
 */
export interface UIKitArgs {
  elements: UIKitElement[];
}