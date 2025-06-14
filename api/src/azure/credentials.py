"""Function for authenticating with Azure."""

from typing import Optional

from azure.identity import ClientSecretCredential
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class AzureCredentials(BaseSettings):
    """Azure credentials."""

    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__",
        extra="ignore",
    )

    azure_client_id: Optional[SecretStr] = None
    """The service principal's client ID"""
    azure_client_secret: Optional[SecretStr] = None
    """One of the service principal's client secrets"""
    azure_scope: Optional[str] = None
    """Desired scopes for the access token"""
    azure_tenant_id: Optional[SecretStr] = None
    """ID of the service principal's tenant. Also called its "directory" ID"""

    openai_api_base: Optional[str] = None
    """The Azure endpoint, including the resource"""
    openai_api_version: Optional[str] = None
    """The API version"""
    openai_api_key: Optional[SecretStr] = None

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

        if self.openai_api_key:
            return self.openai_api_key

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
