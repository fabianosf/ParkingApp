from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.database import init_db
from app.core.seed import run_seed
from app.routers import auth, parking_config, parking_records, users, vehicles


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.uses_sqlite:
        init_db()
    run_seed()
    yield


app = FastAPI(
    title="Estacionamento Corporativo API",
    description="API de controle de estacionamento interno corporativo",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(parking_records.router)
app.include_router(parking_config.router)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "database": "sqlite" if settings.uses_sqlite else "postgres",
    }
