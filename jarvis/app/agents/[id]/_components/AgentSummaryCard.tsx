import AgentCard from "./AgentCard";

export interface AgentSummaryProps {
  description?: string;
  name: string;
  version: string;
  documentationUrl?: string | null;
}

/**
 * Renders a summary card displaying information about an agent, including its name, version,
 * description, and an optional link to documentation.
 *
 * @param {AgentSummaryProps} props - The properties for the AgentSummaryCard component.
 * @param {string} props.description - A brief description of the agent.
 * @param {string} props.name - The name of the agent.
 * @param {string} props.version - The version of the agent.
 * @param {string} [props.documentationUrl] - Optional URL to the agent's documentation.
 * @returns {JSX.Element} The rendered summary card component.
 */
const AgentSummaryCard = ({
  description,
  name,
  version,
  documentationUrl,
}: AgentSummaryProps) => {
  return (
    <AgentCard title={name}>
      <div className="text-accent text-sm font-semibold">v{version}</div>
      <p>{description || "No description available."}</p>
      {documentationUrl && (
        <a
          href={documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Documentation
        </a>
      )}
    </AgentCard>
  );
};

export default AgentSummaryCard;
