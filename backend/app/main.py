"""
Point d'entrée principal — API FastAPI + MCP Server intégré.
"""

import time
import structlog
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

from app.config import get_settings

log = structlog.get_logger()

# ── Simple in-memory rate limiter ─────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 20        # requêtes max
RATE_WINDOW = 60       # par fenêtre de 60 secondes


def is_rate_limited(ip: str) -> bool:
    now = time.time()
    timestamps = _rate_store[ip]
    # Garder seulement les timestamps dans la fenêtre
    _rate_store[ip] = [t for t in timestamps if now - t < RATE_WINDOW]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        return True
    _rate_store[ip].append(now)
    return False


class ChatMessage(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("user", "model"):
            raise ValueError("role must be 'user' or 'model'")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) > 4000:
            raise ValueError("Message trop long (max 4000 caractères)")
        return v


class ChatRequest(BaseModel):
    messages: list[ChatMessage]

    @field_validator("messages")
    @classmethod
    def validate_messages(cls, v: list) -> list:
        if len(v) == 0:
            raise ValueError("La liste de messages est vide")
        if len(v) > 50:
            raise ValueError("Trop de messages dans l'historique (max 50)")
        return v


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("startup", app="egov-liwaza-mcp", env=get_settings().app_env)
    yield
    log.info("shutdown", app="egov-liwaza-mcp")


def create_app() -> FastAPI:
    settings = get_settings()
    is_prod = settings.app_env == "production"

    app = FastAPI(
        title="eGov Liwaza MCP Server",
        description="Serveur MCP pour la plateforme eGov Liwaza CI. Expose des outils fiscaux ivoiriens via le protocole MCP.",
        version="1.0.0",
        lifespan=lifespan,
        # Désactiver la doc Swagger en production
        docs_url=None if is_prod else "/docs",
        redoc_url=None if is_prod else "/redoc",
    )

    # ── CORS — restreint aux origines autorisées ───────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    # ── Rate limiting middleware ───────────────────────────────
    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        if request.url.path == "/api/chat":
            ip = request.client.host if request.client else "unknown"
            if is_rate_limited(ip):
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Trop de requêtes. Veuillez patienter."}
                )
        return await call_next(request)

    @app.get("/health", tags=["System"])
    async def health():
        return {"status": "ok", "app": settings.app_name, "env": settings.app_env}

    @app.get("/", tags=["System"])
    async def root():
        return {
            "app": "eGov Liwaza MCP Server",
            "version": "1.0.0",
            "chat": "/api/chat",
            "tools": "/api/tools",
        }

    @app.get("/api/tools", tags=["MCP"])
    async def list_tools():
        return {
            "tools": [
                {"name": "outil_calcul_tva",         "description": "Calcule la TVA (18%) en CI"},
                {"name": "outil_cotisations_cnps",   "description": "Calcule les cotisations CNPS 2024"},
                {"name": "outil_verification_nif",   "description": "Vérifie le format d'un NIF ivoirien"},
                {"name": "outil_echeances_fiscales", "description": "Calendrier fiscal DGI CI"},
                {"name": "outil_regime_fiscal",      "description": "Infos sur les régimes MICRO/RSI/RNI"},
            ]
        }

    @app.post("/api/chat", tags=["Chat"])
    async def chat_endpoint(request: ChatRequest):
        if not settings.gemini_api_key:
            raise HTTPException(status_code=503, detail="Service temporairement indisponible.")
        try:
            from app.services.chat_service import chat
            gemini_messages = [
                {"role": m.role, "parts": [m.content]}
                for m in request.messages
            ]
            result = chat(gemini_messages)
            return result
        except Exception as e:
            log.error("chat_error", error=str(e))
            # Ne pas exposer le détail de l'erreur en prod
            raise HTTPException(status_code=500, detail="Erreur interne. Veuillez réessayer.")

    return app


app = create_app()
