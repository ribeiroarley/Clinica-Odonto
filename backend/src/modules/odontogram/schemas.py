from datetime import datetime, date
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, field_validator
from src.shared.sanitizer import sanitize_clinical_text


# Tipos Literais alinhados com as restricoes CHECK do banco Oracle
ToothFaceType = Literal["V", "L", "P", "M", "D", "O", "I", "GERAL"]
ToothGeneralStatus = Literal["HIGIDO", "AUSENTE", "IMPLANTE", "PROTESE", "ENDODONTIA", "EM_TRATAMENTO"]
FaceStateType = Literal["CARIE", "RESTAURADO", "FRATURA", "SELADO", "CANAL"]

VALID_FDI_TEETH = {
    # Dentes Permanentes (Quadrantes 1 a 4)
    *range(11, 19), *range(21, 29), *range(31, 39), *range(41, 49),
    # Dentes Deciduos (Quadrantes 5 a 8)
    *range(51, 56), *range(61, 66), *range(71, 76), *range(81, 86)
}


class ToothFaceProcedureResponse(BaseModel):
    id_odonto_proc: int
    id_prontuario: Optional[int] = None
    id_procedimento: int
    nome_procedimento: Optional[str] = None
    face_dente: Optional[ToothFaceType] = None
    estado_face: FaceStateType
    valor_aplicado: Optional[float] = None
    data_registro: datetime


class ToothStateResponse(BaseModel):
    id_odontograma: int
    id_paciente: int
    numero_dente: int = Field(..., description="Numero do dente no padrao FDI (ex: 11 a 48 ou 51 a 85)")
    status_geral: ToothGeneralStatus
    observacoes: Optional[str] = None
    data_atualizacao: datetime
    procedimentos: List[ToothFaceProcedureResponse] = []


class OdontogramProcedureCreate(BaseModel):
    id_paciente: int
    numero_dente: int = Field(..., description="Numero do dente no padrao FDI")
    id_procedimento: int
    id_prontuario: Optional[int] = None
    face_dente: Optional[ToothFaceType] = Field("GERAL", description="Face tratada ou GERAL para dente inteiro")
    estado_face: FaceStateType
    valor_aplicado: Optional[float] = Field(None, ge=0, description="Valor cobrado pelo procedimento")
    status_geral_novo: Optional[ToothGeneralStatus] = Field(
        None, description="Novo status geral a ser atualizado no dente, se aplicavel"
    )
    observacoes: Optional[str] = None

    @field_validator("numero_dente")
    @classmethod
    def validate_fdi_tooth(cls, v: int) -> int:
        if v not in VALID_FDI_TEETH:
            raise ValueError(
                f"Numero de dente {v} invalido para o padrao internacional FDI. "
                "Permanentes aceitos: 11-18, 21-28, 31-38, 41-48. Deciduos aceitos: 51-55, 61-65, 71-75, 81-85."
            )
        return v

    @field_validator("observacoes")
    @classmethod
    def sanitize_notes(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_clinical_text(v)


class OdontogramProcedureResponse(BaseModel):
    id_odonto_proc: int
    id_odontograma: int
    id_paciente: int
    numero_dente: int
    face_dente: Optional[str] = None
    estado_face: str
    valor_aplicado: Optional[float] = None
    data_registro: datetime
    mensagem: str = "Procedimento registrado com sucesso no odontograma."


class PatientOdontogramResponse(BaseModel):
    id_paciente: int
    nome_paciente: str
    total_dentes_registrados: int
    dentes: List[ToothStateResponse]
