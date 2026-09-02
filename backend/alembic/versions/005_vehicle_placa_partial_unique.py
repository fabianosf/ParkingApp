"""partial unique index for active vehicle plates

Revision ID: 005
Revises: 004
"""
from typing import Sequence, Union

from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_vehicles_placa", table_name="vehicles")
    op.execute(
        "CREATE UNIQUE INDEX ix_vehicles_placa_ativa "
        "ON vehicles (placa) WHERE excluido_em IS NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_vehicles_placa_ativa")
    op.create_index("ix_vehicles_placa", "vehicles", ["placa"], unique=True)
