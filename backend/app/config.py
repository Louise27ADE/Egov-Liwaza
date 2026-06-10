from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "egov-liwaza-mcp"
    app_env: str = "development"
    debug: bool = True
    api_key: str = "dev-secret-key"
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
