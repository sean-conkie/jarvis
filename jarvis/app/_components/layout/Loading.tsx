import Spinner from "@/app/_components/Spinner";

/**
 * A loading indicator component that centers a spinner with a "Loading" label.
 * 
 * @returns {JSX.Element} A full-size flex container with a spinner.
 */
const Loading = () => {
  return <div className="w-full h-full flex flex-col items-center justify-center">
    <Spinner label="Loading" spinner="bars" spinnerSize="lg"/>
  </div>;
};

export default Loading;