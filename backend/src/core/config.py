from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Clinica Odontologica API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Database Configuration (Oracle 23ai Free)
    APP_DB_USER: str = "OWNER_ODONTO"
    APP_DB_PASSWORD: str = "OdontoApp#2026"
    APP_DB_SERVICE: str = "FREEPDB1"
    ORACLE_HOST: str = "localhost"
    ORACLE_PORT: int = 1521
    ORACLE_POOL_MIN: int = 2
    ORACLE_POOL_MAX: int = 10
    ORACLE_POOL_INCREMENT: int = 1

    # Security & JWT Token
    SECRET_KEY: str = "odonto_secret_jwt_key_2026_super_secure_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()
