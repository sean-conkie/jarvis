"""Agent Registry Module."""

from typing import Any, Dict, List, Union, overload
from uuid import uuid4

from a2a.server.agent_execution.context import RequestContext
from a2a.server.events.event_queue import EventQueue
from a2a.types import Message, MessageSendParams, Part, Role, TextPart
from pydantic import BeforeValidator, Field
from typing_extensions import Annotated

from api.src.agents.base import BaseAgent
from api.src.openai.tools import ChatCompletionToolParam, create_tool
from api.src.pydantic import ConfiguredBaseModel
from api.src.utils.options import validate_options


class AgentParameters(ConfiguredBaseModel):
    """Base parameters for agents."""

    text: Annotated[str, Field(description="Text to be process by the agent.")]


class A2AOptions(AgentParameters):
    """Options for the A2A agent."""

    message_id: Annotated[
        str,
        Field(
            description="ID of the message to be processed.",
            default_factory=lambda: uuid4().hex,
        ),
    ]
    role: Annotated[
        Role,
        Field(description="Role of the agent in the conversation.", default=Role.agent),
        BeforeValidator(lambda v: Role(v) if isinstance(v, str) else v),
    ]
    thread_id: Annotated[
        str,
        Field(
            description="Thread ID for the agent's context.",
            default_factory=lambda: uuid4().hex,
        ),
    ]


class AgentRegistry:
    """Singleton registry for managing agents."""

    _instance: "AgentRegistry" = None

    def __new__(cls) -> "AgentRegistry":
        """Ensure a single instance of AgentRegistry."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the AgentRegistry with an empty agents dictionary."""
        if not hasattr(self, "_agents"):
            self._agents: Dict[str, BaseAgent] = {}

    def __iter__(self):
        """Return an iterator over the registered agents."""
        return iter(self._agents.values())

    def __contains__(self, agent_id: str) -> bool:
        """Check if an agent with the given id is registered.

        Args:
            agent_id (str): The id of the agent to check.

        Returns:
            bool: True if the agent is registered, False otherwise.

        """
        return agent_id in self._agents

    def register(self, agent: BaseAgent):
        """Register a new agent in the registry.

        Args:
            agent (BaseAgent): The agent instance to register. The agent must have a unique 'id'
                attribute.

        Raises:
            KeyError: If an agent with the same name is already registered.

        Side Effects:
            Modifies the class-level _agents dictionary by adding the new agent.

        """
        self._agents[agent.id] = agent

    def list_agents(self) -> Dict[str, BaseAgent]:
        """Return a dictionary mapping agent names to their corresponding agent classes.

        Returns:
            Dict[str, BaseAgent]: A dictionary where the keys are agent ids (as strings)
            and the values are the agent classes registered in the registry.

        """
        return self._agents

    def get_agent(self, id: str) -> BaseAgent:
        """Retrieve a registered agent class by its name.

        Args:
            id (str): The id of the agent to retrieve.

        Returns:
            BaseAgent: The agent class associated with the given name.

        Raises:
            KeyError: If no agent is registered under the given name.

        """
        return self._agents[id]

    @overload
    def execute_agent(self, options: A2AOptions): ...

    @overload
    def execute_agent(self, options: dict[str, Any]): ...

    @validate_options(A2AOptions)
    async def execute_agent(
        self,
        id: str,
        queue: EventQueue,
        options: Union[A2AOptions, dict[str, Any]],
    ) -> None:
        """Execute the specified agent by name with the provided event queue and options.

        Args:
            id (str): The id of the agent to execute.
            queue (EventQueue): The event queue to be used by the agent.
            options (Union[A2AOptions, dict[str, Any]]): The options for agent execution. Must be
                an instance of A2AOptions.

        Raises:
            AssertionError: If options is not an instance of A2AOptions.

        This method constructs a Message and RequestContext from the provided options,
        retrieves the agent class by name, and invokes its execute method with the constructed
        context and event queue.

        """
        assert isinstance(
            options, A2AOptions
        ), "Options must be an instance of A2AOptions"

        message = Message(
            messageId=options.message_id,
            role=options.role,
            contextId=options.thread_id,
            parts=[
                Part(
                    root=TextPart(
                        kind="text",
                        text=options.text,
                    )
                )
            ],
        )

        context = RequestContext(
            request=MessageSendParams(message=message), context_id=options.thread_id
        )

        agent_cls = self.get_agent(id)
        await agent_cls.execute(
            context=context,
            event_queue=queue,
        )
        await queue.close()

    @property
    def agents_as_tools(self) -> List[ChatCompletionToolParam]:
        """Return a dictionary of agents that can be used as tools.

        Returns:
            Dict[str, BaseAgent]: A dictionary where the keys are agent ids and the values are
            the agent classes that can be used as tools.

        """
        return [
            create_tool(
                name=agent.id,
                description=agent.description,
                parameters=AgentParameters,
                strict=True,
            )
            for agent in self._agents.values()
        ]


agent_registry = AgentRegistry()
