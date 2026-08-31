import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ParkingStatus(str, enum.Enum):
    NO_PATIO = "NO_PATIO"
    FINALIZADO = "FINALIZADO"


class ParkingRecord(Base):
    __tablename__ = "parking_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=False)
    data_entrada: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    data_saida: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    registrado_por: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[ParkingStatus] = mapped_column(Enum(ParkingStatus), nullable=False, default=ParkingStatus.NO_PATIO)

    vehicle = relationship("Vehicle", back_populates="parking_records")
    registrado_por_user = relationship("User", back_populates="parking_records_registered")
