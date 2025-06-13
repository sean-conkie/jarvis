"""Utility functions for creating tool choices and functions."""

from typing import Any, List, Optional

from openai.types.chat.chat_completion_named_tool_choice_param import (
    ChatCompletionNamedToolChoiceParam,
    Function,
)
from openai.types.chat.chat_completion_tool_param import ChatCompletionToolParam
from openai.types.shared_params import FunctionDefinition
from pydantic import BaseModel


def create_tool(
    name: str,
    description: str,
    parameters: dict[str, Any] | type[BaseModel],
    strict: bool = False,
    exclude: Optional[List[str]] = None,
    defaults: Optional[dict[str, Any]] = None,
) -> ChatCompletionToolParam:
    """Create a tool definition to be used in the OpenAI API.

    Args:
        name (str): The name of the function to be called.
        description (str): A description of what the function does.
        parameters (dict[str, Any] | BaseModel): The parameters of the function.
        strict (bool, optional): Whether the function should be called strictly. Defaults to False.
        exclude (Optional[List[str]], optional): The properties to exclude from the parameters.
            Defaults to None.
        defaults (Optional[dict[str, Any]], optional): The default values for the parameters, these
            parameters will be excluded from the schema and should be defaulted post LLM response.
            Defaults to None.

    Returns:
        ChatCompletionToolParam: The function definition.

    """
    schema: dict[str, Any] = {}
    schema = (
        parameters if isinstance(parameters, dict) else parameters.model_json_schema()
    )

    # remove excluded properties and defaulted properties

    _exclude = []
    if exclude:
        _exclude.extend(exclude)
    if defaults:
        _exclude.extend(defaults.keys())

    for key in _exclude or []:
        schema["properties"].pop(key, None)

    if not schema:
        raise ValueError("Parameters must be a Pydantic model or a dictionary.")

    if strict:
        # make sure additionalProperties is set to False
        schema["additionalProperties"] = False

        if "$defs" in schema:
            for _, value in schema["$defs"].items():
                value["additionalProperties"] = False

                # check for required
                if "required" not in value:
                    value["required"] = []
                for key in value.get("properties", []):
                    if key not in value["required"]:
                        value["required"].append(key)

    # recursively remove `default` or `format` properties
    def remove_default(obj):
        if isinstance(obj, dict):
            obj.pop("default", None)
            obj.pop("format", None)
            obj.pop("examples", None)
            obj.pop("maximum", None)
            obj.pop("minimum", None)
            for _, value in obj.items():
                remove_default(value)
        elif isinstance(obj, list):
            for item in obj:
                remove_default(item)

    remove_default(schema)

    # loop each key in properties and make sure it is in required
    if "required" not in schema:
        schema["required"] = []

    for key in schema["properties"]:
        if key not in schema["required"]:
            schema["required"].append(key)

    return ChatCompletionToolParam(
        type="function",
        function=FunctionDefinition(
            name=name,
            description=description,
            parameters=schema,
            strict=strict,
        ),
    )


def tool_choice(name: str) -> ChatCompletionNamedToolChoiceParam:
    """Create a named tool choice to be used in the OpenAI API.

    Args:
        name (str): The name of the tool choice.

    Returns:
        ChatCompletionNamedToolChoiceParam: The named tool choice.

    """
    return ChatCompletionNamedToolChoiceParam(
        type="function", function=Function(name=name)
    )
