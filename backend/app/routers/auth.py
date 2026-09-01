import secrets

from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_mail import FastMail, MessageSchema, MessageType
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.email import mail_config
from app.core.security import (
    assert_password_policy,
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
    FirstAccessPasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
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
        senha_provisoria=False,
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
    must_change = bool(user.senha_provisoria)

    # Token restrito só para troca no 1º acesso; token completo após troca
    access_type = "password_change" if must_change else "access"
    return TokenResponse(
        access_token=create_access_token(token_data, token_type=access_type),
        refresh_token=create_refresh_token(token_data),
        must_change_password=must_change,
    )


@router.post("/change-password-first-access", response_model=TokenResponse)
def change_password_first_access(
    data: FirstAccessPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.senha_provisoria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não possui senha provisória pendente",
        )

    try:
        assert_password_policy(data.nova_senha)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if verify_password(data.nova_senha, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha não pode ser igual à senha atual",
        )

    current_user.senha_hash = hash_password(data.nova_senha)
    current_user.senha_provisoria = False
    db.commit()

    token_data = {"sub": str(current_user.id), "role": current_user.role.value}
    return TokenResponse(
        access_token=create_access_token(token_data, token_type="access"),
        refresh_token=create_refresh_token(token_data),
        must_change_password=False,
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
    must_change = bool(user.senha_provisoria)
    access_type = "password_change" if must_change else "access"
    return TokenResponse(
        access_token=create_access_token(token_data, token_type=access_type),
        refresh_token=create_refresh_token(token_data),
        must_change_password=must_change,
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    generic = ForgotPasswordResponse(
        message="Se o CPF estiver cadastrado, você poderá cadastrar uma nova senha."
    )

    user = db.query(User).filter(User.cpf == data.cpf).first()
    if user is None:
        return generic

    # Invalida tokens anteriores ainda não usados
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.usado.is_(False),
    ).update({PasswordResetToken.usado: True})

    # Invalida a senha atual até concluir o reset
    user.senha_hash = hash_password(secrets.token_urlsafe(32))
    user.senha_provisoria = False

    token = generate_reset_token()
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expira_em=datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES),
    )
    db.add(reset_token)
    db.commit()

    reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/redefinir-senha?token={token}"

    if settings.MAIL_USERNAME:
        message = MessageSchema(
            subject="Redefinição de senha - Estacionamento",
            recipients=[user.email],
            body=(
                f"Sua senha foi bloqueada por segurança.\n\n"
                f"Acesse o link abaixo para cadastrar uma nova senha "
                f"(válido por {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutos):\n\n"
                f"{reset_url}\n"
            ),
            subtype=MessageType.plain,
        )
        fm = FastMail(mail_config)
        await fm.send_message(message)

    return ForgotPasswordResponse(
        message="Senha bloqueada. Cadastre uma nova senha na próxima tela.",
        reset_token=token,
    )


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

    try:
        assert_password_policy(data.nova_senha)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    user.senha_hash = hash_password(data.nova_senha)
    user.senha_provisoria = False
    reset_token.usado = True
    db.commit()
    return MessageResponse(message="Senha redefinida com sucesso")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_user(current_user)
