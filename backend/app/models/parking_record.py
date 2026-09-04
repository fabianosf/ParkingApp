import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.db_types import guid_column, str_enum


class ParkingStatus(str, enum.Enum):
    NO_PATIO = "NO_PATIO"
    FINALIZADO = "FINALIZADO"


class ParkingRecord(Base):
    __tablename__ = "parking_records"

    id: Mapped[uuid.UUID] = mapped_column(guid_column(), primary_key=True, default=uuid.uuid4)
    vehicle_id: Mapped[uuid.UUID] = mapped_column(guid_column(), ForeignKey("vehicles.id"), nullable=False)
    data_entrada: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    data_saida: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    registrado_por: Mapped[uuid.UUID] = mapped_column(guid_column(), ForeignKey("users.id"), nullable=False)
    status: Mapped[ParkingStatus] = mapped_column(
        str_enum(ParkingStatus), nullable=False, default=ParkingStatus.NO_PATIO
    )

    vehicle = relationship("Vehicle", back_populates="parking_records")
    registrado_por_user = relationship("User", back_populates="parking_records_registered")
