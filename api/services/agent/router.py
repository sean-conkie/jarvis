"""Agent service router."""

import asyncio
import uuid
from typing import AsyncGenerator, Dict, List

from a2a.server.events.event_consumer import EventConsumer
from a2a.server.events.event_queue import EventQueue
from a2a.types import AgentCard, Role
from a2a.utils.message import get_message_text
from ag_ui.core import (
    EventType,
    RunAgentInput,
    RunFinishedEvent,
    RunStartedEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    TextMessageStartEvent,
)
from ag_ui.encoder import EventEncoder
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.src.agents.registry import agent_registry

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/", description="List all agents.")
async def list_agents() -> List[AgentCard]:
    """List all available agents."""
    return [agent.card for agent in agent_registry]


# In-memory store mapping job IDs to generators
job_generators: Dict[str, AsyncGenerator[str, None]] = {}


async def process_message(
    agentId: str, message: RunAgentInput
) -> AsyncGenerator[str, None]:
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

    # Generate a message ID for the assistant's response
    message_id = uuid.uuid4().hex

    # Create a streaming completion request
    queue = EventQueue()
    task = asyncio.create_task(
        agent_registry.execute_agent(
            agentId,
            queue=queue,
            options={
                "message_id": message_id,
                "role": Role.user,
                "text": message.messages[0].content,
                "thread_id": message.thread_id,
            },
        )
    )

    consumer = EventConsumer(queue)
    task.add_done_callback(consumer.agent_task_callback)
    started = False
    async for event in consumer.consume_all():
        if not started:
            # Send text message start event
            yield encoder.encode(
                TextMessageStartEvent(
                    type=EventType.TEXT_MESSAGE_START,
                    message_id=message_id,
                    role="assistant",
                )
            )
            started = True

        yield encoder.encode(
            TextMessageContentEvent(
                type=EventType.TEXT_MESSAGE_CONTENT,
                message_id=message_id,
                delta=get_message_text(event),
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


@router.post(
    "{agentId}/start", description="Send new chat message and start processing."
)
async def send_message(
    agentId: str,
    message: RunAgentInput,
):
    """Send a new chat message."""
    # Generate a unique job id
    job_id = message.run_id
    # Store the generator for streaming responses.
    job_generators[job_id] = process_message(agentId, message)
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
