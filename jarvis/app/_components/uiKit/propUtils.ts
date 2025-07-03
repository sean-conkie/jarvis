// 

// Shadow styles
/**
 * A mapping of shadow size keys to their corresponding CSS class names.
 * 
 * The keys represent different shadow sizes, ranging from "2xs" (extra extra small)
 * to "2xl" (extra extra large), as well as "none" for no shadow. The values are
 * the respective CSS class names that can be used to apply the shadow styles.
 *
 * Example usage:
 * ```ts
 * const className = shadowMap['md']; // "shadow-md"
 * ```
 */
export const shadowMap = {
  "2xs": "shadow-2xs",
  xs: "shadow-xs",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  none: "shadow-none",
}

// Border Styles
/**
 * Maps semantic border radius keys to their corresponding Tailwind CSS class names.
 *
 * @remarks
 * This map is useful for dynamically applying border radius classes based on component props.
 *
 * @example
 * ```typescript
 * const className = borderRadiusMap['lg']; // "rounded-lg"
 * ```
 *
 * @property none - No border radius.
 * @property sm - Small border radius.
 * @property md - Medium border radius.
 * @property lg - Large border radius.
 * @property xl - Extra large border radius.
 * @property 2xl - 2x extra large border radius.
 * @property 3xl - 3x extra large border radius.
 * @property 4xl - 4x extra large border radius.
 * @property full - Fully rounded (pill shape).
 */
export const borderRadiusMap = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  "4xl": "rounded-4xl",
  full: "rounded-full",
}

/**
 * Maps border style keywords to their corresponding CSS utility class names.
 *
 * @remarks
 * This object is typically used to convert a logical border style value
 * (such as 'solid', 'dashed', etc.) into a CSS class name that can be
 * applied to elements for styling purposes.
 *
 * @example
 * ```typescript
 * const className = borderStyleMap['dashed']; // "border-dashed"
 * ```
 */
export const borderStyleMap = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
  double: "border-double",
  none: "border-none",
}

// Styles
/**
 * A mapping of style variants to their corresponding CSS class strings.
 *
 * Each key represents a style variant (e.g., 'primary', 'secondary', etc.),
 * and the value is a string containing the CSS classes to apply for that variant.
 *
 * @example
 * // Usage:
 * <div className={styleMap.primary}>Primary Content</div>
 */
export const styleMap = {
  primary: "bg-primary text-primary-content",
  secondary: "bg-secondary text-secondary-content",
  success: "bg-success text-success-content",
  danger: "bg-error text-error-content",
  warning: "bg-warning text-warning-content",
  info: "bg-info text-info-content",
  neutral: "bg-neutral text-neutral-content",
}

/**
 * Maps semantic style keys to their corresponding background CSS class names.
 *
 * @remarks
 * This mapping is typically used to apply consistent background color classes
 * based on a component's status or intent (e.g., primary, success, danger).
 *
 * @example
 * ```typescript
 * const className = styleBackgroundMap["success"]; // "bg-success"
 * ```
 *
 * @property primary   - Maps to the primary background class.
 * @property secondary - Maps to the secondary background class.
 * @property success   - Maps to the success background class.
 * @property danger    - Maps to the error/danger background class.
 * @property warning   - Maps to the warning background class.
 * @property info      - Maps to the info background class.
 * @property neutral   - Maps to the neutral background class.
 */
export const styleBackgroundMap = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  danger: "bg-error",
  warning: "bg-warning",
  info: "bg-info",
  neutral: "bg-neutral",
}

/**
 * A mapping of semantic style keys to their corresponding CSS text color classes.
 *
 * @remarks
 * This map is used to associate semantic names (such as "primary", "success", "danger", etc.)
 * with their respective CSS class names for text color styling.
 *
 * @example
 * ```typescript
 * const className = styleTextMap.primary; // "text-primary"
 * ```
 */
export const styleTextMap = {
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  danger: "text-error",
  warning: "text-warning",
  info: "text-info",
  neutral: "text-neutral",
}

/**
 * Maps style variant names to their corresponding border CSS class names.
 *
 * @remarks
 * This object is used to associate semantic style keys (such as 'primary', 'secondary', etc.)
 * with their respective border class names, which can be used for consistent styling across components.
 *
 * @example
 * ```typescript
 * const borderClass = styleBorderMap.primary; // "border-primary"
 * ```
 */
export const styleBorderMap = {
  primary: "border-primary",
  secondary: "border-secondary",
  success: "border-success",
  danger: "border-error",
  warning: "border-warning",
  info: "border-info",
  neutral: "border-neutral",
}

/**
 * A mapping of outline style keys to their corresponding CSS class names.
 *
 * Keys represent the style variant (e.g., 'primary', 'secondary', etc.),
 * and values are the associated CSS class strings used for styling outlines.
 *
 * @example
 * outlineStyleMap.primary // returns "outline-primary"
 */
export const outlineStyleMap = {
  primary: "outline-primary",
  secondary: "outline-secondary",
  success: "outline-success",
  danger: "outline-error",
  warning: "outline-warning",
  info: "outline-info",
  neutral: "outline-neutral",
}