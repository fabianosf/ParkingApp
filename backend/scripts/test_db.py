from sqlalchemy import create_engine, text

from app.core.config import settings

engine = create_engine(
    settings.resolved_database_url_object,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True,
)

with engine.connect() as conn:
    print("CONNECTED", conn.execute(text("select 1")).scalar())
    tables = conn.execute(
        text("select tablename from pg_tables where schemaname = 'public' order by 1")
    ).fetchall()
    print("TABLES", [t[0] for t in tables])
    admin = conn.execute(
        text("select cpf, role from users where cpf = '05721845732'")
    ).fetchone()
    print("ADMIN", admin)
