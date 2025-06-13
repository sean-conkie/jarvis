"""Chat service router."""

import uuid
from typing import AsyncGenerator, Dict

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
from openai import AzureOpenAI

from api.src.messages.create import create_message
from api.src.openai.tools import create_tool
from api.src.prompts import JARVIS_SYSTEM_PROMPT
from credentials import AzureCredentials

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
    client = AzureOpenAI(
        api_key=credentials.api_key.get_secret_value(),
        azure_endpoint=credentials.openai_api_base,
        api_version=credentials.openai_api_version,
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

    stream = client.chat.completions.create(
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

    if stream.choices[0].message.tool_calls:
        # If the assistant's response includes tool calls, send them as events
        for tool_call in stream.choices[0].message.tool_calls:

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
async def stream_message(runId: str):  # noqa: N803 # pylint: disable=invalid-name
    """Return an SSE stream for the provided job id."""
    generator = job_generators.get(runId)
    if generator is None:
        raise HTTPException(status_code=404, detail="Job not found")
    del job_generators[runId]
    return StreamingResponse(generator, media_type="text/event-stream")
