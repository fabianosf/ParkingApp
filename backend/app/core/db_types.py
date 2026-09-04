"""Tipos SQLAlchemy compatíveis com SQLite e PostgreSQL."""

from sqlalchemy import Enum, Uuid


def guid_column(**kwargs):
    return Uuid(as_uuid=True)


def str_enum(enum_cls):
    """Enum armazenado como string (funciona em SQLite e Postgres)."""
    return Enum(
        enum_cls,
        name=enum_cls.__name__.lower(),
        native_enum=False,
        values_callable=lambda members: [item.value for item in members],
    )
