from pydantic import BaseModel, EmailStr, field_validator

from app.core.security import normalize_cpf, validate_cpf, validate_password_strength


class LoginRequest(BaseModel):
    cpf: str
    senha: str

    @field_validator("cpf")
    @classmethod
    def cpf_valido(cls, v: str) -> str:
        cpf = normalize_cpf(v)
        if not validate_cpf(cpf):
            raise ValueError("CPF inválido")
        return cpf


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
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


class MessageResponse(BaseModel):
    message: str
