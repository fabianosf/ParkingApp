"""
Detecção de ambiente da aplicação.

Prioridade:
1) variável de ambiente APP_ENV
2) arquivo ambiente.txt na raiz do projeto (ParkingApp/ambiente.txt)
3) padrão: local
"""

from __future__ import annotations

from pathlib import Path

# backend/app/core → raiz do repo = parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]
AMBIENTE_FILE = REPO_ROOT / "ambiente.txt"

VALID_ENVIRONMENTS = ("local", "postgres", "docker", "production")

_DEFAULT_SQLITE = f"sqlite:///{(BACKEND_ROOT / 'parking_local.db').as_posix()}"

# Defaults aplicados por ambiente (valores do .env / variáveis de SO têm prioridade)
PROFILE_DEFAULTS: dict[str, dict] = {
    "local": {
        "DATABASE_URL": _DEFAULT_SQLITE,
        "FRONTEND_URL": "http://localhost:5173",
        "CORS_ORIGINS": "http://localhost:5173,http://127.0.0.1:5173",
    },
    "postgres": {
        # Postgres na máquina / Docker mapeado em 5433
        "DATABASE_URL": "postgresql://parking:parking@localhost:5433/parking_db",
        "FRONTEND_URL": "http://localhost:5173",
        "CORS_ORIGINS": "http://localhost:5173,http://127.0.0.1:5173",
    },
    "docker": {
        # API rodando dentro do docker compose (serviço db)
        "DATABASE_URL": "postgresql://parking:parking@db:5432/parking_db",
        "FRONTEND_URL": "http://localhost:8080",
        "CORS_ORIGINS": "http://localhost:8080,http://localhost:5173,http://127.0.0.1:8080",
    },
    "production": {
        # Em produção, DATABASE_URL / SECRET_KEY / etc. vêm do .env ou do host
        "FRONTEND_URL": "http://localhost:8080",
        "CORS_ORIGINS": "http://localhost:8080",
    },
}


def read_ambiente_file() -> str | None:
    if not AMBIENTE_FILE.exists():
        return None
    for raw in AMBIENTE_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        # Aceita "local" ou "AMBIENTE=local"
        if "=" in line:
            key, _, value = line.partition("=")
            if key.strip().upper() in {"AMBIENTE", "APP_ENV", "ENV"}:
                line = value.strip().strip("\"'")
            else:
                continue
        env = line.lower()
        if env in VALID_ENVIRONMENTS:
            return env
    return None


def detect_environment() -> str:
    import os

    from_env = (os.getenv("APP_ENV") or os.getenv("AMBIENTE") or "").strip().lower()
    if from_env in VALID_ENVIRONMENTS:
        return from_env

    from_file = read_ambiente_file()
    if from_file:
        return from_file

    return "local"


def profile_defaults(environment: str) -> dict:
    return dict(PROFILE_DEFAULTS.get(environment, PROFILE_DEFAULTS["local"]))
