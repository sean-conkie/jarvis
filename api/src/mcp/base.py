"""Base classes for agents and MCP sessions."""

from typing import Annotated, Any, Dict, List, Optional, Union, overload

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client
from mcp.types import ListToolsResult
from pydantic import Field, HttpUrl

from api.src.messages.create import ChatCompletionToolMessageParam
from api.src.pydantic import ConfiguredBaseModel
from api.src.tools.base import BaseTool, BaseToolOptions
from api.src.utils.options import validate_options

# region MCP Session


class BaseHttpMcpSession(ConfiguredBaseModel):
    """Base class for HTTP MCP sessions."""

    session_id: Annotated[
        Optional[str], Field(default=None, description="Session ID for the MCP server")
    ]
    stdio_parameters: Annotated[
        Optional[StdioServerParameters],
        Field(
            default=None,
            description="Parameters for stdio communication with the MCP server",
        ),
    ]
    url: Annotated[HttpUrl, Field(description="The URL of the MCP server")]
    use_stdio: Annotated[
        bool,
        Field(
            default=False,
            description="Whether to use stdio for MCP communication (default: False)",
        ),
    ]

    @overload
    async def call_tool(
        self, options: BaseToolOptions
    ) -> ChatCompletionToolMessageParam: ...

    @overload
    async def call_tool(
        self, options: dict[str, Any]
    ) -> ChatCompletionToolMessageParam: ...

    @validate_options(BaseToolOptions)
    async def call_tool(self, name: str, tool_args: Dict[str, Any]) -> Any:
        """Call a tool by its name with the provided arguments.

        Depending on the configuration, this method will either use standard I/O or HTTP to
        communicate with the tool.

        Args:
            name (str): The name of the tool to call.
            tool_args (Dict[str, Any]): A dictionary of arguments to pass to the tool.

        Returns:
            Any: The result returned by the tool.

        Raises:
            Exception: If the tool call fails or encounters an error.

        """
        if self.use_stdio:
            return await self._call_tool_stdio(name, tool_args)
        else:
            return await self._call_tool_http(name, tool_args)

    async def _call_tool_stdio(self, name: str, tool_args: Dict[str, Any]) -> Any:

        assert (
            self.stdio_parameters
        ), "Stdio parameters must be set for stdio communication"

        async with stdio_client(self.stdio_parameters) as (read, write):

            async with ClientSession(read, write) as session:
                # Send JSON-RPC initialize over the pipe
                await session.initialize()

                return await session.call_tool(
                    name=name,
                    arguments=tool_args,
                )

    async def _call_tool_http(self, name: str, tool_args: Dict[str, Any]) -> Any:
        raise NotImplementedError(
            "HTTP tool calls are not implemented in BaseHttpMcpSession."
        )

    async def get_tools(self) -> List[ListToolsResult]:
        """Retrieve a list of available tools.

        Returns:
            List[ListToolsResult]: A list of tool result objects.

        Notes:
            The retrieval method depends on the `use_stdio` attribute. If `use_stdio` is True, tools
                are fetched using the stdio method; otherwise, they are fetched via HTTP.

        """
        if self.use_stdio:
            return await self._get_tools_stdio() or []
        else:
            return await self._get_tools_http() or []

    async def _get_tools_stdio(self):

        assert (
            self.stdio_parameters
        ), "Stdio parameters must be set for stdio communication"

        async with stdio_client(self.stdio_parameters) as (read, write):

            async with ClientSession(read, write) as session:
                # Send JSON-RPC initialize over the pipe
                await session.initialize()

                return await session.list_tools()

    async def _get_tools_http(self):
        raise NotImplementedError(
            "HTTP tool retrieval is not implemented in BaseHttpMcpSession."
        )


# endregion MCP Session


# region MCP Tool


class MCPTool(BaseTool):
    """Base class for MCP tools.

    This class provides a framework for tools that can be called via an MCP session.
    """

    session: Annotated[
        BaseHttpMcpSession,
        Field(description="The MCP session to use for tool calls"),
    ]

    @overload
    async def run(self, options: BaseToolOptions) -> ChatCompletionToolMessageParam: ...

    @overload
    async def run(self, options: dict[str, Any]) -> ChatCompletionToolMessageParam: ...

    @validate_options(BaseToolOptions)
    async def run(
        self, options: Union[BaseToolOptions, dict[str, Any]]
    ) -> ChatCompletionToolMessageParam:
        """Invoke the tool asynchronously."""
        assert isinstance(options, BaseToolOptions), "options is not a BaseToolOptions"
        result = self.initialise_tool_call(options=options)
        if result:
            return result

        return await self.session.call_tool(
            name=self.name, tool_args=self._tool_args.model_dump()
        )


# endregion MCP Tool
