import Badge from "@/app/_components/Badge";
import Card from "@/app/_components/layout/Card";
import { AgentSkill } from "@/types/agents";
import { Tag } from "lucide-react";

const AgentSkillCard = ({ skill }: { skill: AgentSkill }) => {
  return (
    <Card className="bg-base-100 shadow-sm h-fit col-span-1 lg:col-span-2 xl:col-span-1">
      <Card.Title>{skill.name}</Card.Title>

      {/* Tags */}
      <div className="flex flex-row gap-2 flex-wrap w-full">
        {skill.tags?.map((tag) => (
          <Badge key={tag} label={tag} icon={Tag} type="secondary" />
        ))}
      </div>

      {/* Description */}
      <p>{skill.description || "No description available."}</p>

      {/* Input / Output Modes */}
      <h3 className="font-semibold mt-2">Input/Output Modes</h3>
      <table className="table table-header-column w-full">
        <tbody>
          <tr>
            <td>Input</td>
            <td>{skill.inputModes?.join(", ") || "No default input modes"}</td>
          </tr>
          <tr>
            <td>Output</td>
            <td>
              {skill.outputModes?.join(", ") || "No default output modes"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Examples */}
      {skill.examples && skill.examples.length > 0 && (
        <>
          <h3 className="font-semibold mt-2">Examples</h3>
          <ul className="list-disc pl-5">
            {skill.examples.map((example, index) => (
              <li key={index}>
                <em>{example}</em>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
};

export default AgentSkillCard;
