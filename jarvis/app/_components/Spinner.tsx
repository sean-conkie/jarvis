/**
 * Props for the Spinner component.
 *
 * @property {string} [label] - Optional label to display alongside the spinner.
 * @property {'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'} [spinner] - Type of spinner to display. Defaults to 'spinner'.
 * @property {'xs' | 'sm' | 'md' | 'lg'} [spinnerSize] - Size of the spinner. Defaults to 'md'.
 */
export type SpinnerProps = {
  className?: string;
  label?: string;
  spinner?: "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
  spinnerSize?: "xs" | "sm" | "md" | "lg";
};

const spinnerMap: Record<NonNullable<SpinnerProps["spinner"]>, string> = {
  spinner: "loading-spinner",
  dots: "loading-dots",
  ring: "loading-ring",
  ball: "loading-ball",
  bars: "loading-bars",
  infinity: "loading-infinity",
};

const spinnerSizeMap: Record<
  NonNullable<SpinnerProps["spinnerSize"]>,
  string
> = {
  xs: "loading-xs",
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
};

const labelSize: Record<NonNullable<SpinnerProps["spinnerSize"]>, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
};

const Spinner = ({ className, label, spinner, spinnerSize }: SpinnerProps) => {
  const classes = ["loading"];

  if (spinner) classes.push(spinnerMap[spinner]);
  if (spinnerSize) classes.push(spinnerSizeMap[spinnerSize]);

  const labelClasses = ["font-semibold"];
  if (spinnerSize) labelClasses.push(labelSize[spinnerSize]);

  const wrapperClasses = ["flex", "justify-center", "items-center", "gap-4"];
  if (className) wrapperClasses.push(className);

  return (
    <div className={wrapperClasses.filter(Boolean).join(" ")}>
      {label && <span className={labelClasses.join(" ")}>{label}</span>}
      <span aria-label={label || "loading"} className={classes.join(" ")} />
    </div>
  );
};

export default Spinner;
