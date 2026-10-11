"""
Rotas da API para o Copiloto de IA e Auditoria Human-in-the-Loop
Protegido por autenticacao JWT Bearer e RBAC estrito (Apenas DENTISTA e ADMIN).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
import oracledb

from src.core.database import get_db_connection_optional
from src.modules.auth.router import get_current_user, RoleChecker
from src.modules.auth.schemas import TokenPayload
from src.modules.ai_copilot.schemas import (
    AICopilotRequest,
    AICopilotResponse,
    AuditDecisionPayload,
    AuditDecisionResponse,
)
from src.modules.ai_copilot.service import (
    process_copilot_request,
    register_human_decision,
)

router = APIRouter(prefix="/ai/copilot", tags=["Copiloto de IA & Governanca"])

# Guarda RBAC: Apenas profissionais clinicos (Dentistas e Administradores) acessam IA de prontuario
clinical_ai_guard = RoleChecker(allowed_roles=["DENTISTA", "ADMIN"])


@router.post(
    "/odontogram",
    response_model=AICopilotResponse,
    summary="Gerar sugestoes de procedimentos para o odontograma via Copiloto de IA",
)
def generate_odontogram_suggestions(
    request_data: AICopilotRequest,
    current_user: TokenPayload = Depends(clinical_ai_guard),
    conn: Optional[oracledb.Connection] = Depends(get_db_connection_optional),
) -> AICopilotResponse:
    """
    Analisa a narrativa clinica ou queixa do paciente e infere procedimentos/patologias
    no padrao internacional FDI, associando evidencias textuais e alertas de anamnese.
    Gera automaticamente uma trilha de auditoria preliminar pendente de homologacao humana.
    """
    id_dentista = current_user.user_id or 1
    return process_copilot_request(request_data, id_dentista=id_dentista, conn=conn)


@router.post(
    "/audit",
    response_model=AuditDecisionResponse,
    summary="Registrar deliberacao humana do dentista sobre a sugestao da IA (Human-in-the-Loop)",
)
def audit_human_decision(
    decision: AuditDecisionPayload,
    current_user: TokenPayload = Depends(clinical_ai_guard),
    conn: Optional[oracledb.Connection] = Depends(get_db_connection_optional),
) -> AuditDecisionResponse:
    """
    Registra a homologacao humana (ACEITO, MODIFICADO ou REJEITADO) na TB_AUDITORIA_IA.
    Garante conformidade com o Artigo 20 da LGPD (revisao humana de decisoes algoritmicas).
    """
    id_dentista = current_user.user_id or 1
    return register_human_decision(decision, id_dentista=id_dentista, conn=conn)
