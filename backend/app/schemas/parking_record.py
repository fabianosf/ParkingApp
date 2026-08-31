from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.parking_record import ParkingStatus
from app.schemas.vehicle import VehicleResponse


class ParkingRecordResponse(BaseModel):
    id: UUID
    vehicle_id: UUID
    data_entrada: datetime
    data_saida: datetime | None
    registrado_por: UUID
    status: ParkingStatus
    vehicle: VehicleResponse | None = None

    model_config = {"from_attributes": True}


class ParkingEntryRequest(BaseModel):
    vehicle_id: UUID


class ParkingExitRequest(BaseModel):
    vehicle_id: UUID


class DashboardResponse(BaseModel):
    ocupadas: int
    capacidade_maxima: int
    vagas_disponiveis: int
    lotado: bool
    veiculos_no_patio: list[ParkingRecordResponse]
