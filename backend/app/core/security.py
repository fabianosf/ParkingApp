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


def create_access_token(data: dict[str, Any], token_type: str = "access") -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": token_type})
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


DEFAULT_PROVISIONAL_PASSWORD = "12345"
SPECIAL_CHARS = r"!@#$%^&*()\-_+= "


def password_policy_errors(password: str, current_password: str | None = None) -> list[str]:
    """Retorna lista de erros específicos da política de senha."""
    errors: list[str] = []
    if len(password) < 6:
        errors.append("Senha deve ter no mínimo 6 caracteres")
    if not re.search(r"[A-Z]", password):
        errors.append("Senha deve conter ao menos 1 letra maiúscula")
    if not re.search(r"[a-z]", password):
        errors.append("Senha deve conter ao menos 1 letra minúscula")
    if not re.search(r"[0-9]", password):
        errors.append("Senha deve conter ao menos 1 número")
    if not re.search(r"[!@#$%^&*()\-_+=]", password):
        errors.append("Senha deve conter ao menos 1 caractere especial (!@#$%^&*()-_+=)")
    if password == DEFAULT_PROVISIONAL_PASSWORD:
        errors.append("Nova senha não pode ser a senha provisória padrão")
    if current_password is not None and password == current_password:
        errors.append("Nova senha não pode ser igual à senha atual")
    return errors


def validate_password_strength(password: str, current_password: str | None = None) -> bool:
    return len(password_policy_errors(password, current_password)) == 0


def assert_password_policy(password: str, current_password: str | None = None) -> None:
    errors = password_policy_errors(password, current_password)
    if errors:
        raise ValueError("; ".join(errors))
