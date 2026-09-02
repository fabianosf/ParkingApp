#!/usr/bin/env python3
"""Script para criar usuário admin inicial."""

import sys
import uuid
from datetime import datetime, timezone

from passlib.context import CryptContext
from sqlalchemy import create_engine, text

DATABASE_URL = sys.argv[1] if len(sys.argv) > 1 else "postgresql://parking:parking@localhost:5433/parking_db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

nome = input("Nome: ")
cpf = input("CPF (somente números): ")
email = input("Email: ")
senha = input("Senha: ")

engine = create_engine(DATABASE_URL)
user_id = str(uuid.uuid4())
now = datetime.now(timezone.utc).isoformat()
senha_hash = pwd_context.hash(senha)

with engine.connect() as conn:
    conn.execute(
        text(
            "INSERT INTO users (id, nome, cpf, email, senha_hash, role, criado_em, atualizado_em) "
            "VALUES (:id, :nome, :cpf, :email, :senha_hash, 'ADMIN', :now, :now)"
        ),
        {"id": user_id, "nome": nome, "cpf": cpf, "email": email, "senha_hash": senha_hash, "now": now},
    )
    conn.commit()

print(f"Admin criado: {email}")
