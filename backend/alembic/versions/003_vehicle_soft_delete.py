"""vehicle soft delete

Revision ID: 003
"""
from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("vehicles", sa.Column("excluido_em", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("vehicles", "excluido_em")
