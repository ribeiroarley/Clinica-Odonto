import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import oracledb

from src.core.config import settings
from src.core.database import init_db_pool, close_db_pool
from src.modules.auth.router import router as auth_router
from src.modules.patients.router import router as patients_router
from src.modules.odontogram.router import router as odontogram_router

# Configuracao de logs estruturados
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("clinica_odonto.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Ciclo de vida assincrono do FastAPI: inicializa o pool do Oracle no startup
    e garante o fechamento gracioso no shutdown.
    """
    logger.info("Iniciando aplicacao Clinica Odontologica API...")
    init_db_pool()
    yield
    logger.info("Encerrando aplicacao Clinica Odontologica API...")
    close_db_pool()


from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from src.core.limiter import limiter

# Instancia da aplicacao FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "API RESTful Fullstack para Gestao de Clinica Odontologica com suporte "
        "ao padrao internacional FDI (Odontograma), gestao de pacientes, agenda "
        "e prontuario eletronico seguro sobre Oracle 23ai Free."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan,
)

# Configuracao de Rate Limiting (SlowAPI)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configuracao de CORS para integracao com Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Tratador global de excecoes de banco Oracle (evita vazamento de stacktrace interno)
@app.exception_handler(oracledb.DatabaseError)
async def oracle_database_exception_handler(request: Request, exc: oracledb.DatabaseError) -> JSONResponse:
    error_obj, = exc.args
    logger.error(f"Erro no Oracle Database: ORA-{error_obj.code}: {error_obj.message}")

    # Tratamento especifico para erros de violacao de chave unica (ORA-00001)
    if error_obj.code == 1:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": "ConflictError",
                "message": "Registro duplicado detectado no banco de dados.",
                "details": str(error_obj.message),
            },
        )

    # Tratamento para regras de negocio disparadas por RAISE_APPLICATION_ERROR (ORA-20001 a 20002)
    if 20000 <= error_obj.code <= 20999:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "BusinessRuleViolation",
                "message": error_obj.message,
            },
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "DatabaseError",
            "message": "Ocorreu uma falha na operacao com a base de dados relacional.",
            "code": f"ORA-{error_obj.code}",
        },
    )


# Health Check
@app.get("/health", tags=["Infraestrutura"], summary="Health check da API")
def health_check() -> dict:
    """Verifica status basico da aplicacao."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# Registro dos roteadores modulares sob o prefixo /api/v1
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(patients_router, prefix=settings.API_V1_PREFIX)
app.include_router(odontogram_router, prefix=settings.API_V1_PREFIX)
