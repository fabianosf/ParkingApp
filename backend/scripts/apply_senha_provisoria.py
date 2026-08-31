"""Aplica só a coluna senha_provisoria (schema já existia via SQL Editor)."""

from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine

SQL = """
ALTER TABLE users ADD COLUMN IF NOT EXISTS senha_provisoria BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL PRIMARY KEY);
DELETE FROM alembic_version;
INSERT INTO alembic_version (version_num) VALUES ('002');
"""

with engine.begin() as conn:
    for stmt in SQL.strip().split(";"):
        s = stmt.strip()
        if s:
            conn.execute(text(s))
    print("OK: senha_provisoria + alembic stamped at 002")
