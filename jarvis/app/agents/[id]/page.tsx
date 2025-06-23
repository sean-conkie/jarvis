import { AgentCard } from "@/types/agents";
import { backendAxiosInstance } from "@/utils/backendUtils";
import AgentCapabilitiesCard from "./_components/AgentCapabilitiesCard";
import AgentInputOutputCard from "./_components/AgentInputOutputCard";
import AgentProviderCard from "./_components/AgentProviderCard";
import AgentSummaryCard from "./_components/AgentSummaryCard";
import AgentSkillCard from "./_components/AgentSkillCard";

const AgentPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const response = await backendAxiosInstance.get<AgentCard>(`/agent/${id}`);
  const agent = response.data;

  return (
    <div className="h-full overflow-y-scroll">
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <AgentSummaryCard
            name={agent.name}
            description={agent.description}
            documentationUrl={agent.documentationUrl}
            version={agent.version}
          />
          <AgentInputOutputCard
            defaultInputModes={agent.defaultInputModes}
            defaultOutputModes={agent.defaultOutputModes}
          />
        </div>
        <div className="flex flex-col gap-2">
          <AgentCapabilitiesCard {...agent.capabilities} />
          <AgentProviderCard provider={agent.provider} />
        </div>
      </div>
      <div className="p-2">
        <h2 className="my-4 text-xl font-semibold">Skills</h2>
        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
          {agent.skills.map((skill) => (
            <AgentSkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
