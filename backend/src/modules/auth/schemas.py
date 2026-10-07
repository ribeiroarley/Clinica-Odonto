from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


RoleType = Literal["ADMIN", "DENTISTA", "RECEPCAO"]


class LoginRequest(BaseModel):
    username: str = Field(..., description="Email ou documento de identificacao")
    password: str = Field(..., min_length=6, description="Senha do usuario")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: int
    name: str
    role: RoleType


class TokenPayload(BaseModel):
    sub: str
    user_id: int
    name: str
    role: RoleType
    exp: Optional[int] = None


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: RoleType
    cro: Optional[str] = None
