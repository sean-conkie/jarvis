import { AgentCard } from "@/types/agents";
import { backendAxiosInstance } from "@/utils/backendUtils";
import axios from "axios";
import { Logs, MessageCircle } from "lucide-react";
import Container from "../_components/layout/Container";
import Content from "../_components/layout/Content";

const AgentsPage = async () => {
  const response = await backendAxiosInstance
    .get<AgentCard[]>("/agent")
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        // Handle other Axios errors
        if (error.response) {
          console.error(error.response.statusText);
        } else if (error.request) {
          console.error("No response received");
        } else {
          console.error(error.message);
        }
      } else {
        console.error(`Error fetching agents:`, error);
      }

      return null;
    });
  const agents = response?.data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 h-full gap-2">
      <Container className="col-span-1 lg:col-span-2">
        <Content>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th style={{ width: "25%" }}>Skills</th>
                <th>Version</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agents ? (
                agents.map((agent) => {
                  return (
                    <tr key={agent.name}>
                      <td className="align-top">{agent.name}</td>
                      <td className="align-top">{agent.description}</td>
                      <td>
                        <details>
                          <summary>Skills ({agent.skills.length})</summary>
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agent.skills.map((skill, index) => (
                                <tr key={index}>
                                  <td>{skill.name}</td>
                                  <td>{skill.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </details>
                      </td>
                      <td className="align-top">{agent.version}</td>
                      <td className="align-top">
                        <div className="flex flex-row gap-2 items-center">
                          <button className="btn btn-ghost btn-xs">
                            <MessageCircle />
                          </button>
                          <a
                            href={`/agents/${agent.name
                              .replace(/ /g, "-")
                              .toLowerCase()}`}
                            className="btn btn-ghost btn-xs"
                          >
                            <Logs />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No agents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Content>
      </Container>
      <Container className="col-span-1">
        <Content>
          <div>Select an agent to interact with</div>
        </Content>
      </Container>
    </div>
  );
};

export default AgentsPage;
