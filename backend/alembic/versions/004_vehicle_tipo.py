"""vehicle tipo

Revision ID: 004
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None

vehicle_type = sa.Enum("CARRO", "MOTO", "ONIBUS", "CAMINHAO", "OUTRO", name="vehicletype")


def upgrade() -> None:
    vehicle_type.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "vehicles",
        sa.Column("tipo", vehicle_type, nullable=False, server_default="CARRO"),
    )
    op.alter_column("vehicles", "tipo", server_default=None)


def downgrade() -> None:
    op.drop_column("vehicles", "tipo")
    vehicle_type.drop(op.get_bind(), checkfirst=True)
