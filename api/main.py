import uuid

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
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from openai import AzureOpenAI

from api.src.messages.create import create_message
from credentials import AzureCredentials

app = FastAPI(title="AG-UI Endpoint")


@app.post("/awp")
async def my_endpoint(input_data: RunAgentInput):
    async def event_generator():
        # Create an event encoder to properly format SSE events
        encoder = EventEncoder()

        # Send run started event
        yield encoder.encode(
            RunStartedEvent(
                type=EventType.RUN_STARTED,
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
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

        # Send text message start event
        yield encoder.encode(
            TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=message_id,
                role="assistant",
            )
        )

        # Create a streaming completion request
        stream = client.chat.completions.create(
            model="gpt-4o_2024-08-06",
            messages=[
                create_message(**input_message.model_dump())
                for input_message in input_data.messages
            ],
            stream=False,
        )

        # Process the streaming response and send content events
        # for chunk in stream:
        #     if (
        #         hasattr(chunk.choices[0].delta, "content")
        #         and chunk.choices[0].delta.content
        #     ):
        #         content = chunk.choices[0].delta.content
        #         yield encoder.encode(
        #             TextMessageContentEvent(
        #                 type=EventType.TEXT_MESSAGE_CONTENT,
        #                 message_id=message_id,
        #                 delta=content,
        #             )
        #         )

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
                thread_id=input_data.thread_id,
                run_id=input_data.run_id,
            )
        )

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
