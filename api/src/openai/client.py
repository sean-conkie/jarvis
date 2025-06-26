"""Client for OpenAI and Azure OpenAI with caching support."""

from typing import (
    Annotated,
    Any,
    Callable,
    Optional,
    Protocol,
    TypeVar,
    Union,
    overload,
    runtime_checkable,
)

from cachetools import TTLCache, cached
from openai import AsyncAzureOpenAI, AsyncOpenAI, AzureOpenAI, OpenAI
from pydantic import Field, SecretStr, model_serializer

from api.src.settings import ConfiguredBaseSettings
from api.src.utils.options import validate_options

T = TypeVar("T", AzureOpenAI, OpenAI, AsyncAzureOpenAI, AsyncOpenAI)


class Credentials(ConfiguredBaseSettings):
    """Base class for credentials used in OpenAI clients.

    Set OPENAI_API_VERSION and OPENAI_API_KEY in the environment to use the OpenAI API.
    """

    openai_api_version: Annotated[
        Optional[str], Field(serialization_alias="version")
    ] = None
    """The API version"""
    openai_api_key: Annotated[
        Optional[SecretStr], Field(None, serialization_alias="api_key")
    ] = None
    """The OpenAI API key"""

    @property
    def api_key(self) -> Optional[str]:
        """Get the OpenAI API key.

        Returns:
            The OpenAI API key, if set.

        """
        return self.openai_api_key.get_secret_value() if self.openai_api_key else None

    @model_serializer(mode="plain")
    def serialise_to_dict(self) -> Any:
        """Serialize selected attributes of the client to a dictionary.

        Returns:
            dict: A dictionary containing the OpenAI API version and the API key.

        """
        attrs = {
            "version": self.openai_api_version,
        }

        attrs["api_key"] = self.api_key
        return attrs


@runtime_checkable
class CredentialsProtocol(Protocol):
    """Protocol for credentials used in OpenAI clients."""

    api_key: Optional[str]


@overload
def get_client(client: Callable[..., T], options: CredentialsProtocol) -> T: ...


@overload
def get_client(client: Callable[..., T], options: dict[str, Any]) -> T: ...


@validate_options(Credentials)
@cached(cache=TTLCache(maxsize=1, ttl=1800))
def get_client(
    client: Callable[..., T], options: Union[CredentialsProtocol, dict[str, Any]]
) -> T:
    """Initialize and returns an instance of the specified client using the provided credentials or options.

    Args:
        client (Callable[..., T]): The client class or factory function to instantiate.
        options (Union[CredentialsProtocol, dict[str, Any]]): Credentials or configuration options
            for the client. Must be an instance of CredentialsProtocol.

    Returns:
        T: An instance of the specified client, initialized with the provided options.

    Raises:
        AssertionError: If 'options' is not an instance of CredentialsProtocol.

    """
    assert isinstance(
        options, CredentialsProtocol
    ), "Options must be an instance of Credentials"

    by_alias = isinstance(client, (AsyncAzureOpenAI, AzureOpenAI))

    return client(
        **options.model_dump(
            exclude_none=True,
            exclude_unset=True,
            by_alias=by_alias,
        )
    )
