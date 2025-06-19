"""Chat service router."""

import asyncio
import json
import uuid
from typing import AsyncGenerator, Dict

from a2a.server.events.event_consumer import EventConsumer
from a2a.server.events.event_queue import EventQueue
from a2a.types import Role
from a2a.utils.message import get_message_text
from ag_ui.core import (
    EventType,
    RunAgentInput,
    RunFinishedEvent,
    RunStartedEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    TextMessageStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ToolCallStartEvent,
)
from ag_ui.encoder import EventEncoder
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncAzureOpenAI

from api.src.agents.registry import agent_registry
from api.src.azure.credentials import AzureCredentials
from api.src.messages.create import ChatCompletionToolMessageParam, create_message
from api.src.openai.client import get_client
from api.src.openai.tools import create_tool
from api.src.prompts import JARVIS_SYSTEM_PROMPT

router = APIRouter(prefix="/chat", tags=["chat"])


# In-memory store mapping job IDs to generators
job_generators: Dict[str, AsyncGenerator[str, None]] = {}


async def process_message(message: RunAgentInput) -> AsyncGenerator[str, None]:
    """Process the message using the pipeline."""
    # Create an event encoder to properly format SSE events
    encoder = EventEncoder()

    # Send run started event
    yield encoder.encode(
        RunStartedEvent(
            type=EventType.RUN_STARTED,
            thread_id=message.thread_id,
            run_id=message.run_id,
        )
    )

    # Initialize OpenAI client
    credentials = AzureCredentials()
    client = get_client(
        AsyncAzureOpenAI,
        options=credentials,
    )

    # Generate a message ID for the assistant's response
    message_id = uuid.uuid4().hex

    # Create a streaming completion request

    messages = [
        create_message(role="system", content=JARVIS_SYSTEM_PROMPT),
    ]

    messages.extend(
        [
            create_message(**input_message.model_dump())
            for input_message in message.messages
        ]
    )

    tools = [
        create_tool(
            name=tool.name, description=tool.description, parameters=tool.parameters
        )
        for tool in message.tools or []
    ]

    tools.extend(agent_registry.agents_as_tools)

    stream = await client.chat.completions.create(
        model="gpt-4o_2024-08-06",
        messages=messages,
        stream=False,
        tools=tools,
    )

    if stream.choices[0].message.content:
        # If the assistant's response is not empty, send the content event

        # Send text message start event
        yield encoder.encode(
            TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=message_id,
                role="assistant",
            )
        )
        yield encoder.encode(
            TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=message_id,
                delta=stream.choices[0].message.content or "",
            )
        )

        # Send text message end event
        yield encoder.encode(
            TextMessageEndEvent(type=EventType.TEXT_MESSAGE_END, message_id=message_id)
        )

    tool_calls = stream.choices[0].message.tool_calls

    if tool_calls:

        while tool_calls:
            tool_responses = []

            # If the assistant's response includes tool calls, send them as events
            for tool_call in tool_calls:

                if tool_call.function.name in agent_registry:

                    options = json.loads(tool_call.function.arguments or "{}")
                    options["thread_id"] = message.thread_id
                    options["role"] = Role.agent

                    # call the tool
                    queue = EventQueue()
                    task = asyncio.create_task(
                        agent_registry.execute_agent(
                            tool_call.function.name,
                            queue=queue,
                            options=options,
                        )
                    )

                    consumer = EventConsumer(queue)
                    task.add_done_callback(consumer.agent_task_callback)
                    response = None
                    async for event in consumer.consume_all():
                        response = get_message_text(event)

                    tool_response = ChatCompletionToolMessageParam(
                        tool_call_id=tool_call.id,
                        role="tool",
                        content=response or "No response from tool.",
                    )
                    tool_responses.append(tool_response)

                else:

                    # Send tool message start event
                    yield encoder.encode(
                        ToolCallStartEvent(
                            type=EventType.TOOL_CALL_START,
                            parent_message_id=message_id,
                            tool_call_id=tool_call.id,
                            tool_call_name=tool_call.function.name,
                        )
                    )

                    yield encoder.encode(
                        ToolCallArgsEvent(
                            type=EventType.TOOL_CALL_ARGS,
                            tool_call_id=tool_call.id,
                            delta=tool_call.function.arguments or "",
                        )
                    )

                    # Send text message end event
                    yield encoder.encode(
                        ToolCallEndEvent(
                            type=EventType.TOOL_CALL_END, tool_call_id=tool_call.id
                        )
                    )

            messages.append(create_message(**stream.choices[0].message.model_dump()))
            messages.extend(tool_responses)

            stream = await client.chat.completions.create(
                model="gpt-4o_2024-08-06",
                messages=messages,
                stream=False,
                tools=tools,
            )
            tool_calls = stream.choices[0].message.tool_calls

        # Send text message start event
        yield encoder.encode(
            TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=message_id,
                role="assistant",
            )
        )
        yield encoder.encode(
            TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=message_id,
                delta=stream.choices[0].message.content or "",
            )
        )

        # Send text message end event
        yield encoder.encode(
            TextMessageEndEvent(type=EventType.TEXT_MESSAGE_END, message_id=message_id)
        )

    # Send run finished event
    yield encoder.encode(
        RunFinishedEvent(
            type=EventType.RUN_FINISHED,
            thread_id=message.thread_id,
            run_id=message.run_id,
        )
    )


@router.post("/start", description="Send new chat message and start processing.")
async def send_message(
    message: RunAgentInput,
):
    """Send a new chat message."""
    # Generate a unique job id
    job_id = message.run_id
    # Store the generator for streaming responses.
    job_generators[job_id] = process_message(message)
    # Return the job id to the client.
    return {"runId": job_id}


@router.get("/stream/{runId}", description="Stream chat message updates via SSE.")
async def stream_message(runId: str):  # noqa: N803
    """Return an SSE stream for the provided job id."""
    generator = job_generators.get(runId)
    if generator is None:
        raise HTTPException(status_code=404, detail="Job not found")
    del job_generators[runId]
    return StreamingResponse(generator, media_type="text/event-stream")
