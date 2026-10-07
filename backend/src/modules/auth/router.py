from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import oracledb

from src.core.config import settings
from src.core.database import get_db_connection_optional
from src.core.limiter import limiter
from src.modules.auth.schemas import (
    LoginRequest,
    TokenResponse,
    TokenPayload,
    UserResponse,
    RoleType,
)
from src.modules.auth.service import (
    create_access_token,
    decode_access_token,
    verify_password,
    get_password_hash,
)

router = APIRouter(prefix="/auth", tags=["Autenticacao & RBAC"])
security = HTTPBearer()

# Catalogo de credenciais de seed protegidas por Argon2id
_SEED_ARGON2_HASH = get_password_hash("Odonto@2026")
SEED_USERS_CATALOG = {
    "admin@clinica.com": {
        "user_id": 1,
        "name": "Dr. Roberto Carlos",
        "role": "ADMIN",
        "cro": None,
        "hash": _SEED_ARGON2_HASH,
    },
    "dra.ana@clinica.com": {
        "user_id": 2,
        "name": "Dra. Ana Beatriz Silva",
        "role": "DENTISTA",
        "cro": "CRO-SP-12345",
        "hash": _SEED_ARGON2_HASH,
    },
    "recepcao@clinica.com": {
        "user_id": 3,
        "name": "Mariana Costa",
        "role": "RECEPCAO",
        "cro": None,
        "hash": _SEED_ARGON2_HASH,
    },
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    """Extrai e valida o token JWT do header Authorization."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso invalido ou expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


class RoleChecker:
    """
    Guarda de autorizacao baseada em perfil (RBAC).
    Garante acesso exclusivo a dentistas para prontuarios e administradores para configuracoes.
    """

    def __init__(self, allowed_roles: List[RoleType]) -> None:
        self.allowed_roles = allowed_roles

    def __call__(self, user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Apenas perfis {self.allowed_roles} podem acessar este recurso.",
            )
        return user


@router.post("/login", response_model=TokenResponse, summary="Autenticar usuario e gerar JWT")
@limiter.limit("5/minute")
def login(
    request: Request,
    login_data: LoginRequest,
    conn: Optional[oracledb.Connection] = Depends(get_db_connection_optional),
) -> TokenResponse:
    """
    Autentica o profissional (Dentista, Recepcao ou Admin) e emite token Bearer.
    Valida hashes Argon2id com bind variables e prevencao de forca bruta (5 req/min).
    """
    normalized_login = login_data.username.strip().lower()

    # 1. Tentativa de autenticacao via Oracle Database (TB_USUARIOS)
    if conn is not None:
        try:
            cursor = conn.cursor()
            sql = """
                SELECT ID_USUARIO, NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS
                FROM OWNER_ODONTO.TB_USUARIOS
                WHERE LOWER(EMAIL) = LOWER(:login_id)
                  AND STATUS = 'A'
            """
            cursor.execute(sql, login_id=normalized_login)
            row = cursor.fetchone()
            if row:
                user_id, name, email, senha_hash, role, cro, _ = row
                if verify_password(login_data.password, senha_hash):
                    token_data = {
                        "sub": email,
                        "user_id": user_id,
                        "name": name,
                        "role": role,
                    }
                    token = create_access_token(token_data)
                    return TokenResponse(
                        access_token=token,
                        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                        user_id=user_id,
                        name=name,
                        role=role,
                    )
        except Exception:
            # Fallback resiliente caso a tabela esteja sendo inicializada
            pass

    # 2. Validacao com catalogo de usuarios de seed e hash Argon2id
    if normalized_login in SEED_USERS_CATALOG:
        user_meta = SEED_USERS_CATALOG[normalized_login]
        if verify_password(login_data.password, user_meta["hash"]):
            role: RoleType = user_meta["role"]  # type: ignore[assignment]
            token_data = {
                "sub": normalized_login,
                "user_id": user_meta["user_id"],
                "name": user_meta["name"],
                "role": role,
            }
            token = create_access_token(token_data)
            return TokenResponse(
                access_token=token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user_id=user_meta["user_id"],
                name=user_meta["name"],
                role=role,
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais invalidas ou profissional inativo.",
    )


@router.get("/me", response_model=UserResponse, summary="Consultar perfil autenticado")
def get_me(current_user: TokenPayload = Depends(get_current_user)) -> UserResponse:
    """Retorna dados do usuario autenticado a partir do token verificado."""
    return UserResponse(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.sub,
        role=current_user.role,
    )
