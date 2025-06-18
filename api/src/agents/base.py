"""Base classes for agents and MCP sessions."""

import asyncio
from copy import deepcopy
from typing import Annotated, List, Optional

from a2a.server.agent_execution import AgentExecutor
from a2a.server.agent_execution.context import RequestContext
from a2a.server.events.event_queue import EventQueue
from a2a.types import AgentCard, Message
from openai import NOT_GIVEN, AsyncAzureOpenAI, NotGiven
from openai.types.chat.chat_completion import ChatCompletion
from openai.types.chat.chat_completion_message_tool_call import (
    ChatCompletionMessageToolCall,
)
from pydantic import Field

from api.src.azure.credentials import AzureCredentials
from api.src.messages.create import (
    ChatCompletionMessageParam,
    ChatCompletionToolMessageParam,
)
from api.src.openai.client import get_client
from api.src.openai.tools import ChatCompletionToolParam
from api.src.pydantic import ConfiguredBaseModel
from api.src.tools.registry import ToolRegistry

# region Base Agent


class BaseAgent(ConfiguredBaseModel, AgentExecutor, AgentCard):
    """Base class for agents."""

    id: Annotated[str, Field(description="Unique identifier for the agent")]
    instructions: Annotated[
        str, Field(description="Instructions for the agent to follow")
    ]
    model: Annotated[str, Field(description="The model name to use for the agent")]
    tool_registry: Annotated[
        Optional[ToolRegistry],
        Field(description="Registry of tools available to the agent"),
    ]

    @property
    def card(self) -> AgentCard:
        """Create and returns an `AgentCard` instance by validating the current object's data.

        Returns:
            AgentCard: A validated `AgentCard` object constructed from the filtered data of the current instance.

        """
        return AgentCard.model_validate(
            self.model_dump(
                exclude_none=True,
                exclude_unset=True,
                exclude={"id", "model", "instructions", "tools"},
            )
        )

    async def _get_llm_response(
        self,
        messages: List[ChatCompletionMessageParam],
        model: str,
        temperature: float = 0.0,
        tools: list[ChatCompletionToolParam] | NotGiven = NOT_GIVEN,
        tool_choice: Optional[str] = None,
    ) -> ChatCompletion:
        if tool_choice is None:
            tool_choice = "auto"

        # Initialize OpenAI client
        credentials = AzureCredentials()
        client = get_client(
            AsyncAzureOpenAI,
            options=credentials,
        )

        return await client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=temperature,
            tools=tools,
            tool_choice=tool_choice,
        )

    async def _process_tool_call(
        self, tool_call: ChatCompletionMessageToolCall
    ) -> ChatCompletionToolMessageParam:

        if self.tool_registry is None:
            return ChatCompletionToolMessageParam(
                tool_call_id=tool_call.id,
                role="tool",
                content="No tools are available for this agent.",
            )

        tool = self.tool_registry[tool_call.function.name]

        tool_response, _ = await tool.run(options={"tool_call": tool_call})

        if tool_response:
            return tool_response
        return ChatCompletionToolMessageParam(
            tool_call_id=tool_call.id,
            role="tool",
            content="The tool call was not successful.",
        )

    async def _process_message(
        self,
        messages: List[ChatCompletionMessageParam],
        model: str,
        temperature: float = 0.0,
        tools: list[ChatCompletionToolParam] | NotGiven = NOT_GIVEN,
        tool_choice: Optional[str] = None,
    ) -> Message:

        response = await self._get_llm_response(
            messages,
            model,
            tools=tools,
            tool_choice=tool_choice,
            temperature=temperature,
        )

        tool_calls = response.choices[0].message.tool_calls

        while tool_calls:

            # process the response
            assert isinstance(tool_calls, list), "tool_calls is not a list"
            tool_responses = await asyncio.gather(
                *[
                    self._process_tool_call(tool_call)
                    for tool_call in response.toolCalls
                ]
            )

            loop_messages = deepcopy(messages)
            loop_messages.append(response.choices[0].message)
            loop_messages.extend(tool_responses)

            # return the tool responses to the model, if we get more tool calls these
            # will be processed in the next loop
            # if we get a response it will be saved after the loop
            response = await self._get_llm_response(
                loop_messages,
                model,
                tools=tools,
                tool_choice=tool_choice,
                temperature=temperature,
            )

        return response

    async def invoke(self, context: RequestContext) -> Message:
        """Invoke the agent with the given request context.

        Args:
            context (RequestContext): The context of the request to process.

        Returns:
            Message: The response message generated by the agent.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.

        """
        raise NotImplementedError(
            "The invoke method must be implemented by subclasses of BaseAgent."
        )

    async def execute(self, context: RequestContext, event_queue: EventQueue):
        """Execute the agent's main logic using the provided context, then enqueues the result as an event.

        Args:
            context (RequestContext): The context for the current request, containing relevant data
                and metadata.
            event_queue (EventQueue): The event queue where the result of the execution will be
                enqueued.

        Returns:
            None

        Raises:
            Any exceptions raised by the `invoke` method.

        """
        result = await self.invoke(context=context)
        event_queue.enqueue_event(result)

    async def cancel(self, context: RequestContext, event_queue: EventQueue):
        """Cancel the current operation for the agent.

        Args:
            context (RequestContext): The context of the current request.
            event_queue (EventQueue): The event queue to which cancellation events may be posted.

        Raises:
            NotImplementedError: This method must be implemented by subclasses.

        """
        raise NotImplementedError(
            "The cancel method must be implemented by subclasses of BaseAgent."
        )


# endregion Base Agent
