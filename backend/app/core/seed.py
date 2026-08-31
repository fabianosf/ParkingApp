import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import hash_password, normalize_cpf
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)


def seed_admin(db: Session) -> None:
    cpf = normalize_cpf(settings.ADMIN_CPF)
    if not cpf:
        return

    existing = db.query(User).filter(User.cpf == cpf).first()
    if existing:
        if existing.role != UserRole.ADMIN:
            existing.role = UserRole.ADMIN
            db.commit()
        return

    admin = User(
        nome=settings.ADMIN_NOME,
        cpf=cpf,
        email=settings.ADMIN_EMAIL,
        senha_hash=hash_password(settings.ADMIN_SENHA),
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()
    logger.info("Admin inicial criado (CPF %s)", cpf[:3] + "*******")


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_admin(db)
    except Exception as exc:
        logger.warning("Seed admin ignorado (banco indisponível?): %s", exc)
        db.rollback()
    finally:
        db.close()
