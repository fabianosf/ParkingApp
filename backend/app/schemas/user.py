from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.core.security import assert_password_policy, mask_cpf, validate_cpf
from app.models.user import UserRole


class UserCreate(BaseModel):
    """Cadastro público (self-service) — exige senha forte."""

    nome: str
    cpf: str
    email: EmailStr
    senha: str
    confirmar_senha: str
    role: UserRole = UserRole.MOTORISTA

    @field_validator("cpf")
    @classmethod
    def cpf_valido(cls, v: str) -> str:
        if not validate_cpf(v):
            raise ValueError("CPF inválido")
        return "".join(filter(str.isdigit, v))

    @field_validator("senha")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        assert_password_policy(v)
        return v

    @field_validator("confirmar_senha")
    @classmethod
    def senhas_iguais(cls, v: str, info) -> str:
        if "senha" in info.data and v != info.data["senha"]:
            raise ValueError("Senhas não conferem")
        return v


class AdminUserCreate(BaseModel):
    """Admin cadastra colaborador — senha provisória automática (12345)."""

    nome: str
    cpf: str
    email: EmailStr
    role: UserRole = UserRole.MOTORISTA

    @field_validator("cpf")
    @classmethod
    def cpf_valido(cls, v: str) -> str:
        if not validate_cpf(v):
            raise ValueError("CPF inválido")
        return "".join(filter(str.isdigit, v))


class UserUpdate(BaseModel):
    nome: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None


class UserResponse(BaseModel):
    id: UUID
    nome: str
    cpf_mascarado: str
    email: EmailStr
    role: UserRole
    senha_provisoria: bool
    criado_em: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user) -> "UserResponse":
        return cls(
            id=user.id,
            nome=user.nome,
            cpf_mascarado=mask_cpf(user.cpf),
            email=user.email,
            role=user.role,
            senha_provisoria=bool(getattr(user, "senha_provisoria", False)),
            criado_em=user.criado_em,
        )


class ChangePasswordRequest(BaseModel):
    senha_atual: str
    nova_senha: str
    confirmar_senha: str

    @field_validator("nova_senha")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        assert_password_policy(v)
        return v

    @field_validator("confirmar_senha")
    @classmethod
    def senhas_iguais(cls, v: str, info) -> str:
        if "nova_senha" in info.data and v != info.data["nova_senha"]:
            raise ValueError("Senhas não conferem")
        return v
