"""Utility functions for working with Pydantic models."""

import inspect
from typing import Any, Dict, List, Optional, Sequence, Type, TypeGuard, TypeVar

import pydantic
from pydantic import BaseModel, ConfigDict, create_model


class ConfiguredBaseModel(BaseModel):
    """Base model with custom configuration for Pydantic models."""

    model_config = ConfigDict(
        extra="forbid",  # Forbid extra fields
        validate_assignment=True,  # Validate on assignment
        arbitrary_types_allowed=True,  # Allow arbitrary types
    )


T = TypeVar("T", bound=pydantic.BaseModel)


def is_basemodel_type(cls: Any) -> TypeGuard[type[pydantic.BaseModel]]:
    """Check if the given type is a Pydantic BaseModel.

    Args:
        cls (Any): The type to check.

    Returns:
        TypeGuard[type[pydantic.BaseModel]]: True if the type is a Pydantic BaseModel, False
            otherwise.

    """
    if not inspect.isclass(cls):
        return False

    return issubclass(cls, pydantic.BaseModel)


def create_simple_model(
    model_name: str, fields: Sequence[str]
) -> type[T]:  # pyright: ignore[reportInvalidTypeVarUse]
    """Dynamically create a Pydantic model with the specified fields.

    **It is assumed that all fields type are strings, are required and have no default.**

    Use `create_model` from `pydantic` directly if you need more control over the field definitions.

    Args:
        model_name (str): The name of the model to be created.
        fields (Sequence[str]): A sequence of field names to be included in the model.

    Returns:
        T: A dynamically created Pydantic model class with the specified fields.

    """
    field_definitions = {field: (str, ...) for field in fields}

    return create_model(model_name, **field_definitions)  # type: ignore


def model_from_schema(
    name: str,
    schema: Dict[str, Any],
    definitions: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Type[BaseModel]:
    """Dynamically create a Pydantic model from a JSON schema.

    Support for:
      - $ref resolution (internal refs via #/definitions or #/$defs)
      - Nested objects and arrays
      - Default values and required fields.

    Args:
        name: Name of the generated Pydantic model
        schema: JSON schema dict
        definitions: (Internal) dict of shared definition subschemas

    Returns:
        A dynamically generated Pydantic BaseModel subclass

    """
    # Collect definitions from the root schema
    definitions = definitions or {}
    for defs_key in ("definitions", "$defs"):
        if defs_key in schema and isinstance(schema[defs_key], dict):
            definitions.update(schema[defs_key])

    def _resolve_ref(ref: str) -> Dict[str, Any]:
        # Only support internal references of the form '#/definitions/...'
        if not ref.startswith("#/"):
            raise ValueError(f"Unsupported reference: {ref}")
        parts = ref.lstrip("#/").split("/")
        target: Any = schema
        for part in parts:
            target = target.get(part)
            if target is None:
                raise KeyError(f"Reference path not found: {ref}")
        return target

    def _build(subschema: Dict[str, Any], model_name: str) -> Any:
        # Handle $ref
        if "$ref" in subschema:
            ref_schema = _resolve_ref(subschema["$ref"])
            return _build(ref_schema, model_name)

        schema_type = subschema.get("type")
        # Array: build item type recursively
        if schema_type == "array":
            items = subschema.get("items", {})
            item_type = _build(items, model_name + "Item")
            return List[item_type]  # type: ignore

        # Object: build a nested BaseModel
        if schema_type == "object":
            props = subschema.get("properties", {})
            required = set(subschema.get("required", []))
            fields: Dict[str, Any] = {}
            for prop_name, prop_schema in props.items():
                field_type = _build(prop_schema, model_name + prop_name.capitalize())
                # Determine default
                if prop_name in required:
                    default = prop_schema.get("default", ...)
                else:
                    default = prop_schema.get("default", None)
                    field_type = Optional[field_type]  # type: ignore
                fields[prop_name] = (field_type, default)

            # Create and return a new Pydantic model
            return create_model(model_name, __base__=BaseModel, **fields)  # type: ignore

        # Primitive types mapping
        mapping = {
            "string": str,
            "integer": int,
            "number": float,
            "boolean": bool,
            # Fallback for object/array if no detailed props/items provided
            "object": dict,
            "array": list,
        }
        if schema_type in mapping:
            return mapping[schema_type]

        # If no type, allow anything
        return Any

    # Build and return the top-level model
    top_model = _build(schema, name)
    if isinstance(top_model, type) and issubclass(top_model, BaseModel):
        top_model.__name__ = name
        return top_model  # type: ignore
    # If top schema isn't an object, wrap into a model with a single field 'value'
    return create_model(name, __base__=BaseModel, value=(top_model, ...))  # type: ignore
