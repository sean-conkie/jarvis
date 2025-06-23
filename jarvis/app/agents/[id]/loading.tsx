import Skeleton from "@/app/_components/Skeleton";

const AgentLoadingPage = () => {
  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="h-24">
            <Skeleton />
          </div>
          <div className="h-32">
            <Skeleton />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-20">
            <Skeleton />
          </div>
          <div className="h-24">
            <Skeleton />
          </div>
        </div>
      </div>
      <div className="p-2">
        <h2 className="my-4 text-xl font-semibold">Skills</h2>
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
          <div className="h-32">
            <Skeleton />
          </div>
          <div className="h-40">
            <Skeleton />
          </div>
          <div className="h-32">
            <Skeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLoadingPage;
