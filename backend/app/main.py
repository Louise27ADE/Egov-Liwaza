"""
Point d'entrée principal — API FastAPI + MCP Server intégré.
"""

import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import get_settings
from app.mcp_server import mcp

log = structlog.get_logger()


class ChatMessage(BaseModel):
    role: str   # "user" ou "model"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("startup", app="egov-liwaza-mcp", env=get_settings().app_env)
    yield
    log.info("shutdown", app="egov-liwaza-mcp")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="eGov Liwaza MCP Server",
        description=(
            "Serveur MCP pour la plateforme eGov Liwaza CI. "
            "Expose des outils fiscaux ivoiriens (DGI, CNPS) via le protocole MCP."
        ),
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["System"])
    async def health():
        return {"status": "ok", "app": settings.app_name, "env": settings.app_env}

    @app.get("/", tags=["System"])
    async def root():
        return {
            "app": "eGov Liwaza MCP Server",
            "version": "1.0.0",
            "docs": "/docs",
            "mcp": "/mcp",
            "chat": "/api/chat",
        }

    @app.post("/api/chat", tags=["Chat"])
    async def chat_endpoint(request: ChatRequest):
        """
        Endpoint principal de conversation.
        Reçoit l'historique des messages, appelle Gemini,
        exécute les outils MCP si nécessaire, et retourne la réponse.
        """
        if not settings.gemini_api_key:
            raise HTTPException(
                status_code=503,
                detail="GEMINI_API_KEY non configurée sur le serveur."
            )
        try:
            from app.services.chat_service import chat
            # Convertir au format Gemini
            gemini_messages = [
                {"role": m.role, "parts": [m.content]}
                for m in request.messages
            ]
            result = chat(gemini_messages)
            return result
        except Exception as e:
            log.error("chat_error", error=str(e))
            raise HTTPException(status_code=500, detail=str(e))

    # Monter le serveur MCP sur /mcp
    mcp_app = mcp.get_asgi_app()
    app.mount("/mcp", mcp_app)

    return app


app = create_app()
