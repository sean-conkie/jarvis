"""Initialise the agent registry with available agents."""

import logging

from a2a.types import AgentSkill

from api.src.agents.github import create_github_agent
from api.src.agents.registry import agent_registry

logger = logging.getLogger(__name__)


async def initialise_agent_registry() -> None:
    """Initialise the agent registry by loading all agents."""
    logger.info("Initialising agent registry...")

    notification_agent = await create_github_agent(
        name="GitHub Notification Agent",
        description="Agent for managing your GitHub notifications",
        version="0.1.0",
        instructions="This agent handles notifications and alerts.",
        skills=[
            AgentSkill(
                name="List Notifications",
                description="List all notifications from your GitHub account",
                inputModes=["text"],
                outputModes=["text"],
                id="list_notifications",
                tags=["notifications", "github"],
            ),
            AgentSkill(
                name="Get Notification Details",
                description="Get details of a specific notification",
                inputModes=["text"],
                outputModes=["text"],
                id="get_notification_details",
                tags=["notifications", "github"],
            ),
        ],
        allowed_tools={"list_notifications", "get_notification_details"},
        model="gpt-4o-mini_2024-07-18",
        use_stdio=True,
    )

    agent_registry.register(
        notification_agent,
    )
    logger.info("%s agent registered successfully", notification_agent.name)

    # Add more agents as needed

    return agent_registry
