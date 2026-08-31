from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_mail import FastMail, MessageSchema, MessageType
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.email import mail_config
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_reset_token,
    hash_password,
    verify_password,
)
from app.dependencies.auth import get_current_user
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
    if db.query(User).filter(User.cpf == data.cpf).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CPF já cadastrado")

    user = User(
        nome=data.nome,
        cpf=data.cpf,
        email=data.email,
        senha_hash=hash_password(data.senha),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.from_user(user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.cpf == data.cpf).first()
    if user is None or not verify_password(data.senha, user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="CPF ou senha incorretos")

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")

    user = db.query(User).filter(User.id == UUID(payload.get("sub"))).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")

    token_data = {"sub": str(user.id), "role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic_msg = MessageResponse(
        message="Se o email estiver cadastrado, você receberá instruções para redefinir sua senha."
    )

    user = db.query(User).filter(User.email == data.email).first()
    if user is None:
        return generic_msg

    token = generate_reset_token()
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expira_em=datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset_token)
    db.commit()

    if settings.MAIL_USERNAME:
        message = MessageSchema(
            subject="Redefinição de senha - Estacionamento",
            recipients=[user.email],
            body=f"Use o token abaixo para redefinir sua senha (válido por {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutos):\n\n{token}",
            subtype=MessageType.plain,
        )
        fm = FastMail(mail_config)
        await fm.send_message(message)

    return generic_msg


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == data.token).first()
    if (
        reset_token is None
        or reset_token.usado
        or reset_token.expira_em < datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido ou expirado")

    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido ou expirado")

    user.senha_hash = hash_password(data.nova_senha)
    reset_token.usado = True
    db.commit()
    return MessageResponse(message="Senha redefinida com sucesso")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_user(current_user)
