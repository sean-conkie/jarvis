import { AgentProvider } from "@/types/agents";
import AgentCard from "./AgentCard";

/**
 * Renders a card displaying information about an agent's provider.
 *
 * @param provider - The provider information to display. If `undefined` or `null`, a fallback message is shown.
 * @returns A card component with the provider's organization name as a link, or a message if no provider is available.
 */
const AgentProviderCard = ({
  provider,
}: {
  provider?: AgentProvider | null;
}) => {
  return (
    <AgentCard title="Provider">
      {provider ? (
        <div className="text-sm">
          <a
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {provider.organization}
          </a>
        </div>
      ) : (
        <p className="text-sm text-neutral">
          No provider information available.
        </p>
      )}
    </AgentCard>
  );
};

export default AgentProviderCard;
