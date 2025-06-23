import AgentCard from "./AgentCard";

const AgentInputOutputCard = ({
  defaultInputModes,
  defaultOutputModes,
}: {
  defaultInputModes: string[];
  defaultOutputModes: string[];
}) => {
  return (
    <AgentCard title="Input/Output Modes">
      <table className="table table-header-column w-full">
        <tbody>
          <tr>
            <td>Input</td>
            <td>{defaultInputModes.join(", ") || "No default input modes"}</td>
          </tr>
          <tr>
            <td>Output</td>
            <td>
              {defaultOutputModes.join(", ") || "No default output modes"}
            </td>
          </tr>
        </tbody>
      </table>
    </AgentCard>
  );
};

export default AgentInputOutputCard;
