from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class ParkingConfigResponse(BaseModel):
    id: UUID
    capacidade_maxima: int
    atualizado_em: datetime

    model_config = {"from_attributes": True}


class ParkingConfigUpdate(BaseModel):
    capacidade_maxima: int

    @field_validator("capacidade_maxima")
    @classmethod
    def capacidade_positiva(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Capacidade deve ser no mínimo 1")
        return v
