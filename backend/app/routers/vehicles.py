from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import get_current_user_full_access, require_role
from app.models.parking_record import ParkingRecord, ParkingStatus
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.schemas.auth import MessageResponse
from app.schemas.user import UserResponse
from app.schemas.vehicle import VehicleAutocomplete, VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


def _vehicle_response(vehicle: Vehicle) -> VehicleResponse:
    return VehicleResponse(
        id=vehicle.id,
        placa=vehicle.placa,
        modelo=vehicle.modelo,
        cor=vehicle.cor,
        owner_id=vehicle.owner_id,
        owner=UserResponse.from_user(vehicle.owner) if vehicle.owner else None,
        criado_em=vehicle.criado_em,
    )


@router.get("/", response_model=list[VehicleResponse])
def list_vehicles(
    filtro: str | None = Query(None, description="Filtrar por placa, modelo ou proprietário"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_full_access),
):
    query = db.query(Vehicle).options(joinedload(Vehicle.owner))
    if current_user.role == UserRole.MOTORISTA:
        query = query.filter(Vehicle.owner_id == current_user.id)
    elif filtro:
        term = f"%{filtro.upper()}%"
        query = query.join(Vehicle.owner).filter(
            (Vehicle.placa.ilike(term))
            | (Vehicle.modelo.ilike(term))
            | (User.nome.ilike(term))
        )
    vehicles = query.order_by(Vehicle.placa).all()
    return [_vehicle_response(v) for v in vehicles]


@router.get("/autocomplete", response_model=list[VehicleAutocomplete])
def autocomplete_placa(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    term = f"%{q.upper().replace('-', '').replace(' ', '')}%"
    vehicles = db.query(Vehicle).filter(Vehicle.placa.ilike(term)).limit(10).all()
    return vehicles


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_full_access),
):
    vehicle = db.query(Vehicle).options(joinedload(Vehicle.owner)).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")

    if current_user.role == UserRole.MOTORISTA and vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")

    return _vehicle_response(vehicle)


@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    if db.query(Vehicle).filter(Vehicle.placa == data.placa).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Placa já cadastrada")

    owner = db.query(User).filter(User.id == data.owner_id).first()
    if owner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proprietário não encontrado")

    vehicle = Vehicle(placa=data.placa, modelo=data.modelo, cor=data.cor, owner_id=data.owner_id)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    vehicle = db.query(Vehicle).options(joinedload(Vehicle.owner)).filter(Vehicle.id == vehicle.id).first()
    return _vehicle_response(vehicle)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: UUID,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    vehicle = db.query(Vehicle).options(joinedload(Vehicle.owner)).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")

    if data.placa is not None:
        existing = db.query(Vehicle).filter(Vehicle.placa == data.placa, Vehicle.id != vehicle_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Placa já cadastrada")
        vehicle.placa = data.placa
    if data.modelo is not None:
        vehicle.modelo = data.modelo
    if data.cor is not None:
        vehicle.cor = data.cor
    if data.owner_id is not None:
        owner = db.query(User).filter(User.id == data.owner_id).first()
        if owner is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proprietário não encontrado")
        vehicle.owner_id = data.owner_id

    db.commit()
    db.refresh(vehicle)
    vehicle = db.query(Vehicle).options(joinedload(Vehicle.owner)).filter(Vehicle.id == vehicle.id).first()
    return _vehicle_response(vehicle)


@router.delete("/{vehicle_id}", response_model=MessageResponse)
def delete_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")

    active = (
        db.query(ParkingRecord)
        .filter(ParkingRecord.vehicle_id == vehicle_id, ParkingRecord.status == ParkingStatus.NO_PATIO)
        .first()
    )
    if active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veículo possui registro ativo no pátio. Registre a saída antes de excluir.",
        )

    db.delete(vehicle)
    db.commit()
    return MessageResponse(message="Veículo excluído com sucesso")
