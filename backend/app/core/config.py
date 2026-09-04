from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings
from sqlalchemy.engine import make_url
from sqlalchemy.engine.url import URL

from app.core.environment import detect_environment, profile_defaults


class Settings(BaseSettings):
    # local | postgres | docker | production
    APP_ENV: str = "local"

    DATABASE_URL: str = ""

    # Supabase (opcional — se preenchidos, montam DATABASE_URL automaticamente)
    SUPABASE_URL: str = ""
    SUPABASE_PROJECT_REF: str = ""
    SUPABASE_DB_PASSWORD: str = ""
    SUPABASE_DB_HOST: str = ""
    SUPABASE_USE_POOLER: bool = False
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    MAIL_USE_CREDENTIALS: bool = True

    ADMIN_CPF: str = ""
    ADMIN_SENHA: str = "CHANGE_ME_ADMIN_PASSWORD"
    ADMIN_NOME: str = "Administrador"
    ADMIN_EMAIL: str = "admin@parking.local"

    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:8081,http://127.0.0.1:8081"
    )
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @model_validator(mode="before")
    @classmethod
    def apply_environment_profile(cls, data: dict) -> dict:
        if not isinstance(data, dict):
            data = {}

        env = (data.get("APP_ENV") or detect_environment()).strip().lower()
        data["APP_ENV"] = env

        for key, value in profile_defaults(env).items():
            current = data.get(key)
            if current is None or current == "":
                data[key] = value

        # Garante DATABASE_URL mesmo se profile não setou (production sem .env)
        if not data.get("DATABASE_URL"):
            data["DATABASE_URL"] = profile_defaults("local")["DATABASE_URL"]

        return data

    @property
    def uses_sqlite(self) -> bool:
        return self.DATABASE_URL.strip().lower().startswith("sqlite")

    @property
    def resolved_database_url(self) -> str:
        return str(self.resolved_database_url_object)

    @property
    def resolved_database_url_object(self) -> URL:
        if self.uses_sqlite:
            return make_url(self.DATABASE_URL)

        if self.DATABASE_URL and "supabase" in self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://") and "+psycopg" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg://", 1)
            return make_url(url)

        project_ref = (self.SUPABASE_PROJECT_REF or "").strip()
        db_password = (self.SUPABASE_DB_PASSWORD or "").strip()
        placeholder_refs = {"", "SEU_PROJECT_REF", "seu_project_ref_aqui"}
        placeholder_passwords = {"", "sua-senha-do-banco", "sua_senha_real"}

        if project_ref and project_ref not in placeholder_refs and db_password not in placeholder_passwords:
            if self.SUPABASE_USE_POOLER:
                host = self.SUPABASE_DB_HOST or "aws-0-us-east-1.pooler.supabase.com"
                username = f"postgres.{project_ref}"
                port = 6543
            else:
                host = self.SUPABASE_DB_HOST or f"db.{project_ref}.supabase.co"
                username = "postgres"
                port = 5432
            return URL.create(
                drivername="postgresql+psycopg",
                username=username,
                password=db_password,
                host=host,
                port=port,
                database="postgres",
                query={"sslmode": "require"},
            )
        url = self.DATABASE_URL
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return make_url(url)

    @property
    def uses_supabase(self) -> bool:
        if self.uses_sqlite:
            return False
        url = self.resolved_database_url
        project_ref = (self.SUPABASE_PROJECT_REF or "").strip()
        placeholder_refs = {"", "SEU_PROJECT_REF", "seu_project_ref_aqui"}
        return "supabase" in url or (project_ref not in placeholder_refs)


settings = Settings()
