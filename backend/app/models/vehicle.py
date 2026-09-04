import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.db_types import guid_column, str_enum


class VehicleType(str, enum.Enum):
    CARRO = "CARRO"
    MOTO = "MOTO"
    ONIBUS = "ONIBUS"
    CAMINHAO = "CAMINHAO"
    OUTRO = "OUTRO"


class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        Index(
            "ix_vehicles_placa_ativa",
            "placa",
            unique=True,
            sqlite_where=text("excluido_em IS NULL"),
            postgresql_where=text("excluido_em IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(guid_column(), primary_key=True, default=uuid.uuid4)
    placa: Mapped[str] = mapped_column(String(7), nullable=False, index=True)
    modelo: Mapped[str] = mapped_column(String(100), nullable=False)
    cor: Mapped[str] = mapped_column(String(50), nullable=False)
    tipo: Mapped[VehicleType] = mapped_column(str_enum(VehicleType), nullable=False, default=VehicleType.CARRO)
    owner_id: Mapped[uuid.UUID] = mapped_column(guid_column(), ForeignKey("users.id"), nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    excluido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", back_populates="vehicles")
    parking_records = relationship("ParkingRecord", back_populates="vehicle")
