"""GitHub MCP Agent using GitHub MCP Server."""

from a2a.types import AgentCapabilities, AgentSkill
from mcp.client.stdio import StdioServerParameters
from pydantic import SecretStr

from api.src.agents.base import BaseAgent
from api.src.mcp.base import BaseHttpMcpSession
from api.src.settings import ConfiguredBaseSettings
from api.src.tools.registry import ToolRegistry


class GitHubMcpSettings(ConfiguredBaseSettings):
    """Settings for the GitHub MCP Agent."""

    github_token: SecretStr
    """GitHub Personal Access Token (PAT) for MCP access"""

    use_stdio: bool = True


settings = GitHubMcpSettings()

stdio_params = StdioServerParameters(
    command="docker",
    args=[
        "run",
        "-i",
        "--rm",
        "-e",
        f"GITHUB_PERSONAL_ACCESS_TOKEN={settings.github_token.get_secret_value()}",
        "ghcr.io/github/github-mcp-server",
    ],
)


async def create_github_agent(
    name: str,
    description: str,
    version: str,
    instructions: str,
    skills: list[AgentSkill] = None,
    allowed_tools: set[str] = None,
    model: str = "gpt-4o-mini_2024-07-18",
    use_stdio: bool = settings.use_stdio,
) -> BaseAgent:
    """Create and configures a GitHub agent with specified parameters.

    Args:
        name (str): The name of the agent.
        description (str): A brief description of the agent's purpose.
        version (str): The version identifier for the agent.
        instructions (str): Instructions or guidelines for the agent's operation.
        skills (list[AgentSkill], optional): A list of skills to assign to the agent. Defaults to
            None.
        allowed_tools (set[str], optional): A set of tool names the agent is permitted to use.
            Defaults to None.
        model (str, optional): The model identifier to use for the agent. Defaults to
            "gpt-4o-mini_2024-07-18".
        use_stdio (bool, optional): Whether to use stdio for communication. Defaults to True.

    Returns:
        BaseAgent: An instance of the configured GitHub agent.

    Raises:
        Any exceptions raised during tool registration or agent creation.

    """
    agent_id = name.lower().replace(" ", "-")

    tool_registry = ToolRegistry()

    github_mcp = BaseHttpMcpSession(
        session_id=f"{agent_id}-github-mcp-session",
        stdio_parameters=stdio_params,
        use_stdio=use_stdio,
    )

    await tool_registry.register_mcp_server(github_mcp, allowed_tools)

    return BaseAgent(
        capabilities=AgentCapabilities(
            pushNotifications=False, stateTransitionHistory=False, streaming=False
        ),
        defaultInputModes=["text"],
        defaultOutputModes=["text"],
        description=description,
        url="https://localhost:41241",
        version=version,
        id=agent_id,
        name=name,
        model=model,
        instructions=instructions,
        skills=skills or [],
        tool_registry=tool_registry,
    )
