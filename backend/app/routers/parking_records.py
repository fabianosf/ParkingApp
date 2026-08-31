from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import get_current_user_full_access, require_role
from app.models.parking_config import ParkingConfig
from app.models.parking_record import ParkingRecord, ParkingStatus
from app.models.user import User, UserRole
from app.models.vehicle import Vehicle
from app.schemas.parking_record import (
    DashboardResponse,
    ParkingEntryRequest,
    ParkingExitRequest,
    ParkingRecordResponse,
)
from app.schemas.user import UserResponse
from app.schemas.vehicle import VehicleResponse

router = APIRouter(prefix="/parking-records", tags=["parking-records"])


def _get_config(db: Session) -> ParkingConfig:
    config = db.query(ParkingConfig).first()
    if config is None:
        config = ParkingConfig(capacidade_maxima=50)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def _record_response(record: ParkingRecord) -> ParkingRecordResponse:
    vehicle_data = None
    if record.vehicle:
        vehicle_data = VehicleResponse(
            id=record.vehicle.id,
            placa=record.vehicle.placa,
            modelo=record.vehicle.modelo,
            cor=record.vehicle.cor,
            owner_id=record.vehicle.owner_id,
            owner=UserResponse.from_user(record.vehicle.owner) if record.vehicle.owner else None,
            criado_em=record.vehicle.criado_em,
        )
    return ParkingRecordResponse(
        id=record.id,
        vehicle_id=record.vehicle_id,
        data_entrada=record.data_entrada,
        data_saida=record.data_saida,
        registrado_por=record.registrado_por,
        status=record.status,
        vehicle=vehicle_data,
    )


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    config = _get_config(db)
    records = (
        db.query(ParkingRecord)
        .options(joinedload(ParkingRecord.vehicle).joinedload(Vehicle.owner))
        .filter(ParkingRecord.status == ParkingStatus.NO_PATIO)
        .order_by(ParkingRecord.data_entrada.desc())
        .all()
    )
    ocupadas = len(records)
    return DashboardResponse(
        ocupadas=ocupadas,
        capacidade_maxima=config.capacidade_maxima,
        vagas_disponiveis=max(0, config.capacidade_maxima - ocupadas),
        lotado=ocupadas >= config.capacidade_maxima,
        veiculos_no_patio=[_record_response(r) for r in records],
    )


@router.get("/", response_model=list[ParkingRecordResponse])
def list_records(
    vehicle_id: UUID | None = Query(None),
    data_inicio: datetime | None = Query(None),
    data_fim: datetime | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_full_access),
):
    query = db.query(ParkingRecord).options(
        joinedload(ParkingRecord.vehicle).joinedload(Vehicle.owner)
    )

    if current_user.role == UserRole.MOTORISTA:
        query = query.join(Vehicle).filter(Vehicle.owner_id == current_user.id)

    if vehicle_id:
        query = query.filter(ParkingRecord.vehicle_id == vehicle_id)
    if data_inicio:
        query = query.filter(ParkingRecord.data_entrada >= data_inicio)
    if data_fim:
        query = query.filter(ParkingRecord.data_entrada <= data_fim)

    records = query.order_by(ParkingRecord.data_entrada.desc()).all()
    return [_record_response(r) for r in records]


@router.post("/entry", response_model=ParkingRecordResponse, status_code=status.HTTP_201_CREATED)
def register_entry(
    data: ParkingEntryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
    if vehicle is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Veículo não encontrado")

    active = (
        db.query(ParkingRecord)
        .filter(ParkingRecord.vehicle_id == data.vehicle_id, ParkingRecord.status == ParkingStatus.NO_PATIO)
        .first()
    )
    if active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veículo já possui registro ativo no pátio",
        )

    config = _get_config(db)
    ocupadas = db.query(ParkingRecord).filter(ParkingRecord.status == ParkingStatus.NO_PATIO).count()
    if ocupadas >= config.capacidade_maxima:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Pátio lotado. Capacidade máxima atingida.")

    record = ParkingRecord(
        vehicle_id=data.vehicle_id,
        data_entrada=datetime.now(timezone.utc),
        registrado_por=current_user.id,
        status=ParkingStatus.NO_PATIO,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    record = (
        db.query(ParkingRecord)
        .options(joinedload(ParkingRecord.vehicle).joinedload(Vehicle.owner))
        .filter(ParkingRecord.id == record.id)
        .first()
    )
    return _record_response(record)


@router.post("/exit", response_model=ParkingRecordResponse)
def register_exit(
    data: ParkingExitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    record = (
        db.query(ParkingRecord)
        .options(joinedload(ParkingRecord.vehicle).joinedload(Vehicle.owner))
        .filter(ParkingRecord.vehicle_id == data.vehicle_id, ParkingRecord.status == ParkingStatus.NO_PATIO)
        .first()
    )
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum registro ativo encontrado para este veículo",
        )

    record.data_saida = datetime.now(timezone.utc)
    record.status = ParkingStatus.FINALIZADO
    db.commit()
    db.refresh(record)
    return _record_response(record)
