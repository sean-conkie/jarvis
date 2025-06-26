"""Function for authenticating with Azure."""

from typing import Annotated, Any, Optional

from azure.identity import ClientSecretCredential
from pydantic import Field, SecretStr, model_serializer

from api.src.settings import ConfiguredBaseSettings


class AzureCredentials(ConfiguredBaseSettings):
    """Azure credentials."""

    azure_client_id: Optional[SecretStr] = None
    """The service principal's client ID"""
    azure_client_secret: Optional[SecretStr] = None
    """One of the service principal's client secrets"""
    azure_scope: Optional[str] = None
    """Desired scopes for the access token"""
    azure_tenant_id: Optional[SecretStr] = None
    """ID of the service principal's tenant. Also called its "directory" ID"""

    openai_api_base: Annotated[
        Optional[str], Field(serialization_alias="azure_endpoint")
    ] = None
    """The Azure endpoint, including the resource"""
    openai_api_version: Annotated[
        Optional[str], Field(serialization_alias="api_version")
    ] = None

    @property
    def api_key(self) -> SecretStr:
        """Get the Azure API key.

        Returns
            api_key: The Azure API key.

        """
        if all(
            [
                self.azure_client_id,
                self.azure_client_secret,
                self.azure_tenant_id,
                self.azure_scope,
            ]
        ):

            if self.azure_scope is None:
                raise ValueError("Azure scope must be set to get the API key")
            return SecretStr(self._get_credentials().get_token(self.azure_scope).token)

        raise ValueError("Credentials must be set")

    def _get_credentials(self) -> ClientSecretCredential:
        """Get the credentials for the Azure Blob Storage account.

        Returns
            credentials: The credentials for the Azure Blob Storage account.

        """
        if all(
            [
                self.azure_client_id,
                self.azure_client_secret,
                self.azure_tenant_id,
            ]
        ):

            return ClientSecretCredential(
                **{
                    "client_id": (
                        self.azure_client_id.get_secret_value()
                        if self.azure_client_id
                        else ""
                    ),
                    "client_secret": (
                        self.azure_client_secret.get_secret_value()
                        if self.azure_client_secret
                        else ""
                    ),
                    "tenant_id": (
                        self.azure_tenant_id.get_secret_value()
                        if self.azure_tenant_id
                        else ""
                    ),
                }
            )

        raise ValueError("Azure credentials must be set")

    def __hash__(self) -> int:
        """Hash the Azure credentials.

        Returns
            int: The hash of the Azure credentials.

        """
        return hash(
            (
                self.azure_client_id,
                self.azure_client_secret,
                self.azure_scope,
                self.azure_tenant_id,
                self.openai_api_base,
                self.openai_api_version,
            )
        )

    @model_serializer(mode="plain")
    def serialise_to_dict(self) -> Any:
        """Serialize the credential attributes to a dictionary.

        Returns:
            dict: A dictionary containing the Azure endpoint, API version, and API key.

        """
        attrs = {
            "azure_endpoint": self.openai_api_base,
            "api_version": self.openai_api_version,
        }

        attrs["api_key"] = self.api_key.get_secret_value()
        return attrs
