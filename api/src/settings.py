"""Settings for the API application."""

import logging
from functools import lru_cache
from typing import Annotated

from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict
from uvicorn.logging import DefaultFormatter


class ConfiguredBaseSettings(BaseSettings):
    """Azure credentials."""

    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )


class Settings(ConfiguredBaseSettings):
    """Settings for the API application."""

    # General settings
    app_name: str = "Jarvis"
    app_version: str = "0.1.0"

    # Logging settings
    log_level: Annotated[
        int, BeforeValidator(lambda x: logging.getLevelNamesMapping()[x])
    ] = "INFO"

    # Other settings can be added here as needed


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Create and returns an instance of the Settings class.

    Returns:
        Settings: A new instance of the Settings configuration.

    """
    return Settings()


# elsewhere:
env = get_settings()

# Configure logging
logging.basicConfig(level=env.log_level)

# Set the default formatter for all loggers to the uvicorn DefaultFormatter
root_logger = logging.getLogger()
for handler in root_logger.handlers:
    handler.setFormatter(DefaultFormatter(fmt="%(levelprefix)s %(message)s"))
