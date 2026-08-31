from logging.config import fileConfig
import os

from alembic import context
from sqlalchemy import create_engine, pool

from app.core.config import settings
from app.core.database import Base
from app.models import (  # noqa: F401
    ParkingConfig,
    ParkingRecord,
    PasswordResetToken,
    User,
    Vehicle,
)

config = context.config
database_url = settings.resolved_database_url_object

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=str(database_url),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    os.environ.setdefault("PGCLIENTENCODING", "UTF8")
    connect_args = {"sslmode": "require", "client_encoding": "utf8"} if settings.uses_supabase else {}
    connectable = create_engine(
        database_url,
        connect_args=connect_args,
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
