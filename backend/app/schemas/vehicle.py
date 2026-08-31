from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, field_validator

from app.core.security import normalize_placa, validate_placa
from app.schemas.user import UserResponse


class VehicleCreate(BaseModel):
    placa: str
    modelo: str
    cor: str
    owner_id: UUID

    @field_validator("placa")
    @classmethod
    def placa_valida(cls, v: str) -> str:
        if not validate_placa(v):
            raise ValueError("Placa inválida. Use formato antigo (ABC1234) ou Mercosul (ABC1D23)")
        return normalize_placa(v)


class VehicleUpdate(BaseModel):
    placa: str | None = None
    modelo: str | None = None
    cor: str | None = None
    owner_id: UUID | None = None

    @field_validator("placa")
    @classmethod
    def placa_valida(cls, v: str | None) -> str | None:
        if v is not None and not validate_placa(v):
            raise ValueError("Placa inválida. Use formato antigo (ABC1234) ou Mercosul (ABC1D23)")
        return normalize_placa(v) if v else v


class VehicleResponse(BaseModel):
    id: UUID
    placa: str
    modelo: str
    cor: str
    owner_id: UUID
    owner: UserResponse | None = None
    criado_em: datetime

    model_config = {"from_attributes": True}


class VehicleAutocomplete(BaseModel):
    id: UUID
    placa: str
    modelo: str

    model_config = {"from_attributes": True}
