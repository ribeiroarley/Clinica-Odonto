from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from src.shared.sanitizer import sanitize_clinical_text


def validate_cpf_digits(cpf_raw: str) -> str:
    """Valida e higieniza o CPF brasileiro segundo o algoritmo dos digitos verificadores."""
    clean = "".join(ch for ch in cpf_raw if ch.isdigit())
    if len(clean) != 11:
        raise ValueError("O CPF deve conter exatamente 11 digitos numericos.")
    if clean == clean[0] * 11:
        raise ValueError("CPF invalido (sequencia repetida).")

    # Primeiro digito
    soma = sum(int(clean[i]) * (10 - i) for i in range(9))
    d1 = (soma * 10 % 11) % 10
    if d1 != int(clean[9]):
        raise ValueError("Primeiro digito verificador do CPF e invalido.")

    # Segundo digito
    soma = sum(int(clean[i]) * (11 - i) for i in range(10))
    d2 = (soma * 10 % 11) % 10
    if d2 != int(clean[10]):
        raise ValueError("Segundo digito verificador do CPF e invalido.")

    return clean


class PatientBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Nome completo do paciente")
    cpf: str = Field(..., description="CPF com ou sem formatacao")
    birth_date: date = Field(..., description="Data de nascimento")
    phone: Optional[str] = Field(None, max_length=20, description="Telefone de contato")
    email: Optional[EmailStr] = Field(None, description="Email de contato")
    address: Optional[str] = Field(None, max_length=255, description="Endereco residencial")

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, v: str) -> str:
        return validate_cpf_digits(v)

    @field_validator("name", "address")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_clinical_text(v)


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(None, max_length=255)


class PatientResponse(BaseModel):
    id_paciente: int
    nome: str
    cpf: str
    data_nascimento: date
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    data_cadastro: datetime
    status: str
    idade: Optional[int] = None


class PatientListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[PatientResponse]
