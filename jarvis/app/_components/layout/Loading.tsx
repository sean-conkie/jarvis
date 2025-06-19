import Spinner from "@/app/_components/Spinner";

const Loading = () => {
  return <div className="w-full h-full flex flex-col items-center justify-center">
    <Spinner label="Loading" spinner="bars" spinnerSize="lg"/>
  </div>;
};

export default Loading;