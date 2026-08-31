import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def validate_cpf(cpf: str) -> bool:
    cpf = normalize_cpf(cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    for i in range(9, 11):
        total = sum(int(cpf[num]) * ((i + 1) - num) for num in range(0, i))
        digit = (total * 10 % 11) % 10
        if int(cpf[i]) != digit:
            return False
    return True


def normalize_cpf(cpf: str) -> str:
    return re.sub(r"\D", "", cpf)


def mask_cpf(cpf: str) -> str:
    cpf = normalize_cpf(cpf)
    if len(cpf) != 11:
        return "***.***.***-**"
    return f"***.***.{cpf[6:9]}-{cpf[9:]}"


def validate_placa(placa: str) -> bool:
    placa = placa.upper().replace("-", "").replace(" ", "")
    old_format = re.match(r"^[A-Z]{3}[0-9]{4}$", placa)
    mercosul = re.match(r"^[A-Z]{3}[0-9][A-Z][0-9]{2}$", placa)
    return bool(old_format or mercosul)


def normalize_placa(placa: str) -> str:
    return placa.upper().replace("-", "").replace(" ", "")


def validate_password_strength(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True
