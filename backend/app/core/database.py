from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings

_connect_args: dict = {}
_engine_kwargs: dict = {"pool_pre_ping": True}

if settings.uses_sqlite:
    _connect_args = {"check_same_thread": False}
    # Arquivo SQLite: uma conexão compartilhada evita locks estranhos no Windows
    if ":memory:" in settings.DATABASE_URL:
        _engine_kwargs["poolclass"] = StaticPool
elif settings.uses_supabase:
    _connect_args = {"sslmode": "require"}

engine = create_engine(
    settings.resolved_database_url_object,
    connect_args=_connect_args,
    **_engine_kwargs,
)

if settings.uses_sqlite:

    @event.listens_for(engine, "connect")
    def _sqlite_on_connect(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Cria tabelas (usado no modo SQLite local)."""
    # Importa models para registrar metadata
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
