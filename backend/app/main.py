"""
Point d'entrée principal — API FastAPI + MCP Server intégré.
"""

import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.mcp_server import mcp

log = structlog.get_logger()

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)


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
        allow_origins=settings.origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check — pas d'authentification requise
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
        }

    # Monter le serveur MCP sur /mcp
    # Le transport SSE permet au frontend React de communiquer en temps réel
    mcp_app = mcp.get_asgi_app()
    app.mount("/mcp", mcp_app)

    return app


app = create_app()
