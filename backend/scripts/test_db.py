from sqlalchemy import create_engine, text

from app.core.config import settings

connect_args = {"sslmode": "require"} if settings.uses_supabase else {}

engine = create_engine(
    settings.resolved_database_url_object,
    connect_args=connect_args,
    pool_pre_ping=True,
)

with engine.connect() as conn:
    print("CONNECTED", conn.execute(text("select 1")).scalar())
    tables = conn.execute(
        text("select tablename from pg_tables where schemaname = 'public' order by 1")
    ).fetchall()
    print("TABLES", [t[0] for t in tables])
    admin_cpf = (settings.ADMIN_CPF or "").strip()
    if admin_cpf:
        admin = conn.execute(
            text("select cpf, role from users where cpf = :cpf"),
            {"cpf": admin_cpf},
        ).fetchone()
        print("ADMIN", admin)
    else:
        print("ADMIN_CPF não definido no .env")
