from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.auth import MessageResponse
from app.schemas.user import ChangePasswordRequest, UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserResponse])
def list_users(
    filtro: str | None = Query(None, description="Filtrar por nome, email ou CPF"),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    query = db.query(User)
    if filtro:
        term = f"%{filtro}%"
        query = query.filter(
            (User.nome.ilike(term)) | (User.email.ilike(term)) | (User.cpf.ilike(term))
        )
    users = query.order_by(User.nome).all()
    return [UserResponse.from_user(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permissão insuficiente")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
    return UserResponse.from_user(user)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
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


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    if data.nome is not None:
        user.nome = data.nome
    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
        user.email = data.email
    if data.role is not None:
        user.role = data.role

    db.commit()
    db.refresh(user)
    return UserResponse.from_user(user)


@router.delete("/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível excluir a si mesmo")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    db.delete(user)
    db.commit()
    return MessageResponse(message="Usuário excluído com sucesso")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.senha_atual, current_user.senha_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta")

    current_user.senha_hash = hash_password(data.nova_senha)
    db.commit()
    return MessageResponse(message="Senha alterada com sucesso")
