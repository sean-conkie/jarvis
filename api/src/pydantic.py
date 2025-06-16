"""Pydantic functions for API models."""

from pydantic import BaseModel, ConfigDict


class ConfiguredBaseModel(BaseModel):
    """Base model with custom configuration for Pydantic models."""

    model_config = ConfigDict(
        extra="forbid",  # Forbid extra fields
        validate_assignment=True,  # Validate on assignment
        arbitrary_types_allowed=True,  # Allow arbitrary types
    )
