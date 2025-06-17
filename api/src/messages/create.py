"""Utility functions for the Azure module."""

from typing import Iterable, Literal, Union, overload

from openai.types.chat import (
    ChatCompletionAssistantMessageParam,
    ChatCompletionContentPartParam,
    ChatCompletionContentPartTextParam,
    ChatCompletionFunctionMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionMessageToolCallParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionUserMessageParam,
)


@overload
def create_message(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
    role: Literal["user"],
    name: Union[str, None] = None,
    tool_call_id: None = None,
    refusal: None = None,
    tool_calls: None = None,
) -> ChatCompletionUserMessageParam: ...


@overload
def create_message(
    content: str,
    role: Literal["assistant"],
    name: Union[str, None] = None,
    tool_call_id: None = None,
    refusal: Union[str, None] = None,
    tool_calls: Union[Iterable[ChatCompletionMessageToolCallParam], None] = None,
) -> ChatCompletionAssistantMessageParam: ...


@overload
def create_message(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
    role: Literal["system"],
    name: Union[str, None] = None,
    tool_call_id: None = None,
    refusal: None = None,
    tool_calls: None = None,
) -> ChatCompletionSystemMessageParam: ...


@overload
def create_message(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
    role: Literal["tool"],
    name: str,
    tool_call_id: str,
    refusal: None = None,
    tool_calls: None = None,
) -> ChatCompletionToolMessageParam: ...


@overload
def create_message(
    content: Union[str, Iterable[ChatCompletionContentPartTextParam]],
    role: Literal["tool"],
    name: None,
    tool_call_id: str,
    refusal: None = None,
    tool_calls: None = None,
) -> ChatCompletionToolMessageParam: ...


@overload
def create_message(
    content: str,
    role: Literal["function"],
    name: Union[str, None] = None,
    tool_call_id: None = None,
    refusal: None = None,
    tool_calls: None = None,
) -> ChatCompletionFunctionMessageParam: ...


def create_message(  # pylint: disable=unused-argument, line-too-long
    content: Union[
        str,
        Iterable[ChatCompletionContentPartTextParam],
        Iterable[ChatCompletionContentPartParam],
    ],
    role: Literal["system", "user", "assistant", "tool", "function"],
    name: Union[str, None] = None,
    tool_call_id: Union[str, None] = None,
    refusal: Union[str, None] = None,
    tool_calls: Union[Iterable[ChatCompletionMessageToolCallParam], None] = None,
    **kwargs,
) -> ChatCompletionMessageParam:
    """Create a message parameter for the OpenAI API.

    Args:
        content (Union[str, Iterable[ChatCompletionContentPartTextParam], Iterable[ChatCompletionContentPartParam]]):
            The content of the message.
        role (Literal["system", "user", "assistant", "tool", "function"]): The role of the message.
        name (Union[str, None]): The name of the message.
        tool_call_id (Union[str, None]): The tool call ID.
        refusal (Union[str, None]): The refusal message.
        tool_calls (Union[Iterable[ChatCompletionMessageToolCallParam], None]): The tool calls.
        **kwargs: Additional keyword arguments.

    Returns:
            ChatCompletionMessageParam: The message parameter.

    """
    args = {
        "content": content,
        "role": role,
        "name": name,
        "tool_call_id": tool_call_id,
        "refusal": refusal,
        "tool_calls": tool_calls,
    }
    args = {k: v for k, v in args.items() if v}

    if role == "agent":
        # map A2A agent role to OpenAI assistant role
        role = "assistant"
        args["role"] = "assistant"

    match role:
        case "system":
            return ChatCompletionSystemMessageParam(**args)
        case "user":
            return ChatCompletionUserMessageParam(**args)
        case "assistant":
            return ChatCompletionAssistantMessageParam(**args)
        case "tool":
            return ChatCompletionToolMessageParam(**args)
        case "function":
            return ChatCompletionFunctionMessageParam(**args)
        case _:
            raise ValueError("Invalid role")
