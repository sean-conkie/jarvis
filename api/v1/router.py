"""v1 API Router."""

from fastapi import APIRouter

from api.services.agent.router import router as agent_router
from api.services.chat.router import router as chat_router

router = APIRouter(prefix="/v1")
router.include_router(agent_router)
router.include_router(chat_router)
