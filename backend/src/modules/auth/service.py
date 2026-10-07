from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from src.core.config import settings
from src.modules.auth.schemas import TokenPayload

# Configuracao de hashing de senhas: Argon2id prioritario com compatibilidade retroativa para bcrypt
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto plano confere com o hash Argon2id/Bcrypt."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Gera hash seguro no padrao Argon2id para uma nova senha."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Gera token JWT criptografado com dados do usuario e expiracao."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp())})
    encoded_jwt: str = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenPayload]:
    """Valida e decodifica o token JWT retornando o payload tipado."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return TokenPayload(**payload)
    except (JWTError, Exception):
        return None
