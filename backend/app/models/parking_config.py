import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.db_types import guid_column


class ParkingConfig(Base):
    __tablename__ = "parking_config"

    id: Mapped[uuid.UUID] = mapped_column(guid_column(), primary_key=True, default=uuid.uuid4)
    capacidade_maxima: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
