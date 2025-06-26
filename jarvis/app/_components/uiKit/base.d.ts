/**
 * Props shared by base UI components.
 *
 * @property className - Optional CSS class name(s) to apply to the component.
 */
export type BaseProps = {
  className?: string;
};

/**
 * Props for the `Card` component.
 *
 * @template T - The type of the children elements.
 * @property {React.ReactNode} children - The content to be rendered inside the card.
 * @property {string} [title] - Optional title to display at the top of the card.
 * @property {BaseProps} ...BaseProps - Additional base properties inherited from `BaseProps`.
 */
export type CardProps = PropsWithChildren<
  BaseProps & {
    title?: string;
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
export type Element =
  | { type: "card"; props?: CardProps | null; children: (string | Element) | null }
  | { type: HtmlTag; props?: Props | null; children?: (string | Element)[] | null };

/**
 * Represents a response containing an array of elements.
 *
 * @property elements - An array of `Element` objects included in the response.
 */
export interface UIKitArgs {
  elements: Element[];
}