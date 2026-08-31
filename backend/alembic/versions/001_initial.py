"""initial migration

Revision ID: 001
Revises:
Create Date: 2026-08-31
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nome", sa.String(255), nullable=False),
        sa.Column("cpf", sa.String(11), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("senha_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("ADMIN", "MOTORISTA", name="userrole"), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_cpf", "users", ["cpf"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("token", sa.String(255), nullable=False),
        sa.Column("expira_em", sa.DateTime(timezone=True), nullable=False),
        sa.Column("usado", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_password_reset_tokens_token", "password_reset_tokens", ["token"], unique=True)

    op.create_table(
        "vehicles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("placa", sa.String(7), nullable=False),
        sa.Column("modelo", sa.String(100), nullable=False),
        sa.Column("cor", sa.String(50), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_vehicles_placa", "vehicles", ["placa"], unique=True)

    op.create_table(
        "parking_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("vehicles.id"), nullable=False),
        sa.Column("data_entrada", sa.DateTime(timezone=True), nullable=False),
        sa.Column("data_saida", sa.DateTime(timezone=True), nullable=True),
        sa.Column("registrado_por", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("NO_PATIO", "FINALIZADO", name="parkingstatus"),
            nullable=False,
        ),
    )

    op.create_table(
        "parking_config",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("capacidade_maxima", sa.Integer(), nullable=False, server_default="50"),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("parking_config")
    op.drop_table("parking_records")
    op.drop_table("vehicles")
    op.drop_table("password_reset_tokens")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS parkingstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
