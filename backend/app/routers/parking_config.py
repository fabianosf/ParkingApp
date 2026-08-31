from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_role
from app.models.parking_config import ParkingConfig
from app.models.user import UserRole
from app.schemas.parking_config import ParkingConfigResponse, ParkingConfigUpdate

router = APIRouter(prefix="/parking-config", tags=["parking-config"])


def _get_or_create_config(db: Session) -> ParkingConfig:
    config = db.query(ParkingConfig).first()
    if config is None:
        config = ParkingConfig(capacidade_maxima=50)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("/", response_model=ParkingConfigResponse)
def get_config(
    db: Session = Depends(get_db),
    _: object = Depends(require_role(UserRole.ADMIN)),
):
    return _get_or_create_config(db)


@router.put("/", response_model=ParkingConfigResponse)
def update_config(
    data: ParkingConfigUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role(UserRole.ADMIN)),
):
    config = _get_or_create_config(db)
    config.capacidade_maxima = data.capacidade_maxima
    db.commit()
    db.refresh(config)
    return config
