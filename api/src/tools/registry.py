"""Tool Registry Module."""

from typing import List, Optional

from openai.types.chat.chat_completion_tool_param import ChatCompletionToolParam

from api.src.mcp.base import BaseHttpMcpSession, MCPTool
from api.src.pydantic import model_from_schema
from api.src.tools.base import BaseTool


class ToolRegistry:
    """A registry for managing tools.

    This class allows for the registration and retrieval of tools by their names.
    """

    def __init__(self):
        self._tools = {}

    def __getitem__(self, name: str) -> BaseTool:
        """Get a tool by its name.

        Args:
            name (str): The name of the tool to retrieve.

        Returns:
            BaseTool: The tool instance associated with the given name.

        Raises:
            KeyError: If no tool with the specified name is registered.

        """
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered.")
        return self._tools[name]

    def __contains__(self, name: str) -> bool:
        """Check if a tool is registered by its name.

        Args:
            name (str): The name of the tool to check.

        Returns:
            bool: True if the tool is registered, False otherwise.

        """
        return name in self._tools

    def register_tool(self, tool: type[BaseTool]):
        """Register a tool class in the internal tools registry.

        Args:
            tool (type[BaseTool]): The tool class to register. Must be a subclass of BaseTool and
                have a 'name' attribute.

        Raises:
            AttributeError: If the tool does not have a 'name' attribute.

        """
        self._tools[tool.name] = tool

    async def register_mcp_server(
        self,
        mcp_server: type[BaseHttpMcpSession],
        allowed_tools: Optional[set[str]] = None,
    ):
        """Register tools from a given MCP server.

        Iterates through the list of tools provided by the specified MCP server class,
        and registers each tool that is either in the allowed_tools set or, if allowed_tools
        is None, all available tools. Each tool is wrapped as an MCPTool instance with its
        name, description, input schema, and session, and then registered.

        Args:
            mcp_server (type[BaseHttpMcpSession]): The MCP server class to retrieve tools from.
            allowed_tools (Optional[set[str]], optional): A set of tool names to allow for registration.
                If None, all tools from the server will be registered. Defaults to None.

        """
        tools = await mcp_server.list_tools()
        for tool in tools.tools:
            if allowed_tools is None or tool.name in allowed_tools:
                mcp_tool = MCPTool(
                    name=tool.name,
                    description=tool.description,
                    tool_call_schema=model_from_schema(tool.name, tool.input_schema),
                    session=mcp_server,
                )
                self.register_tool(mcp_tool)

    @property
    def tools(self) -> List[ChatCompletionToolParam]:
        """Return a list of all registered tools."""
        return [i.card for i in self._tools.values() if isinstance(i, BaseTool)]
