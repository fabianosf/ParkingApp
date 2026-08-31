from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.core.security import mask_cpf, normalize_placa, validate_cpf, validate_password_strength, validate_placa
from app.models.user import UserRole


class UserCreate(BaseModel):
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
        if not validate_password_strength(v):
            raise ValueError(
                "Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo"
            )
        return v

    @field_validator("confirmar_senha")
    @classmethod
    def senhas_iguais(cls, v: str, info) -> str:
        if "senha" in info.data and v != info.data["senha"]:
            raise ValueError("Senhas não conferem")
        return v


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
            criado_em=user.criado_em,
        )


class ChangePasswordRequest(BaseModel):
    senha_atual: str
    nova_senha: str
    confirmar_senha: str

    @field_validator("nova_senha")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        if not validate_password_strength(v):
            raise ValueError(
                "Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo"
            )
        return v

    @field_validator("confirmar_senha")
    @classmethod
    def senhas_iguais(cls, v: str, info) -> str:
        if "nova_senha" in info.data and v != info.data["nova_senha"]:
            raise ValueError("Senhas não conferem")
        return v
