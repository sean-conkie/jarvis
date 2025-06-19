"use client";

import { AgentCard } from "@/types/agents";
import { backendAxiosInstance } from "@/utils/backendUtils";
import { useEffect, useState } from "react";
import Container from "../_components/layout/Container";
import Content from "../_components/layout/Content";
import Loading from "../_components/layout/Loading";
import { MessageCircle } from "lucide-react";

const AgentsPage = () => {
  // manage state for agents
  const [agents, setAgents] = useState<AgentCard[]>([]);
  // manage state for loading agents
  const [loading, setLoading] = useState<boolean>(false);

  // load agents from the server
  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await backendAxiosInstance.get<AgentCard[]>("/agent");
      setAgents(response.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 h-full gap-2 lg:gap-0">
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
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <Loading />
                  </td>
                </tr>
              ) : (
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
                      <td className="align-top"><div className="flex flex-row gap-2 items-center"><button><MessageCircle /></button></div></td>
                    </tr>
                  );
                })
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
