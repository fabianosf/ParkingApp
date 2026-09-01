from urllib.parse import quote_plus

from sqlalchemy.engine import make_url

from pydantic_settings import BaseSettings
from sqlalchemy.engine.url import URL


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://parking:parking@localhost:5432/parking_db"

    # Supabase (opcional — se preenchidos, montam DATABASE_URL automaticamente)
    SUPABASE_URL: str = ""
    SUPABASE_PROJECT_REF: str = ""
    SUPABASE_DB_PASSWORD: str = ""
    SUPABASE_DB_HOST: str = ""
    SUPABASE_USE_POOLER: bool = False
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""

    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
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

    ADMIN_CPF: str = "05721845732"
    ADMIN_SENHA: str = "260281xx"
    ADMIN_NOME: str = "Administrador"
    ADMIN_EMAIL: str = "admin@parking.local"

    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:8081,http://127.0.0.1:8081"
    )
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

    @property
    def resolved_database_url(self) -> str:
        return str(self.resolved_database_url_object)

    @property
    def resolved_database_url_object(self) -> URL:
        if self.DATABASE_URL and "supabase" in self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgresql://") and "+psycopg" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg://", 1)
            return make_url(url)

        if self.SUPABASE_PROJECT_REF and self.SUPABASE_DB_PASSWORD:
            if self.SUPABASE_USE_POOLER:
                host = self.SUPABASE_DB_HOST or "aws-0-us-east-1.pooler.supabase.com"
                username = f"postgres.{self.SUPABASE_PROJECT_REF}"
                port = 6543
            else:
                host = self.SUPABASE_DB_HOST or f"db.{self.SUPABASE_PROJECT_REF}.supabase.co"
                username = "postgres"
                port = 5432
            return URL.create(
                drivername="postgresql+psycopg",
                username=username,
                password=self.SUPABASE_DB_PASSWORD,
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
        url = self.resolved_database_url
        return "supabase" in url or bool(self.SUPABASE_PROJECT_REF)


settings = Settings()
