"""
Schemas Pydantic V2 para o Copiloto Clinico de Odontograma e Auditoria de IA
Em conformidade com a LGPD (Art. 6º, III e Art. 20) e EU AI Act (Art. 12 e 14).
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ToothProcedureSuggestion(BaseModel):
    numero_dente: int = Field(
        ...,
        ge=11,
        le=85,
        description="Numero no padrao internacional FDI (11..48 permanentes ou 51..85 deciduos)",
    )
    face_dente: str = Field(
        ...,
        pattern="^(V|L|M|D|O|GERAL)$",
        description="Face anatomica: V (Vestibular), L (Lingual), M (Mesial), D (Distal), O (Oclusal) ou GERAL",
    )
    estado_face: str = Field(
        ...,
        description="Estado clinico: CARIE, RESTAURADO, CANAL, IMPLANTE, AUSENTE, HIGIDO",
    )
    id_procedimento: int = Field(
        ...,
        description="Identificador correspondente na TB_PROCEDIMENTOS",
    )
    nome_procedimento: str = Field(
        ...,
        description="Nome padronizado do procedimento odontologico",
    )
    evidencia_texto: str = Field(
        ...,
        description="Citacao textual e explicabilidade que fundamentou a recomendacao algoritmica",
    )
    valor_estimado: Optional[float] = Field(
        default=None,
        description="Valor base do procedimento para previsao de custos",
    )


class AICopilotRequest(BaseModel):
    id_paciente: int = Field(..., description="Identificador do paciente em atendimento")
    relato_clinico: str = Field(
        ...,
        min_length=5,
        max_length=5000,
        description="Relato livre da queixa, anamnese ou evolucao clinica ditada pelo dentista",
    )
    historico_anamnese: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Historico pregresso de patologias, medicamentos em uso e alergias",
    )


class AICopilotResponse(BaseModel):
    id_auditoria_ia: int = Field(
        ...,
        description="Identificador unico da recomendacao na TB_AUDITORIA_IA",
    )
    sugestoes: List[ToothProcedureSuggestion] = Field(
        default_factory=list,
        description="Lista de procedimentos e patologias sugeridas para cada face dentaria",
    )
    alertas_anamnese: List[str] = Field(
        default_factory=list,
        description="Alertas de seguranca clinica (alergias, interacoes medicamentosas, sangramento)",
    )
    confianca_geral: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Indice estatistico de confianca da inferencia algoritmica",
    )
    nome_modelo: str = Field(
        default="Med-Dental-Copilot-v1",
        description="Nome do modelo/pipeline de IA utilizado",
    )
    versao_modelo: str = Field(
        default="1.2.0",
        description="Versao semantica do modelo de inferencia",
    )
    disclaimer: str = Field(
        default="AVISO REGULATORIO & LGPD: Esta e uma recomendacao algoritmica assistiva. A decisao diagnostica, adequacao tecnica e assinatura clinica sao de responsabilidade exclusiva do cirurgiao-dentista com CRO ativo (Human-in-the-Loop mandatario).",
        description="Isencao de responsabilidade e salvaguarda etica",
    )


class AuditDecisionPayload(BaseModel):
    id_auditoria_ia: int = Field(
        ...,
        description="ID da recomendacao de IA registrada na TB_AUDITORIA_IA",
    )
    id_paciente: int = Field(
        ...,
        description="ID do paciente auditado",
    )
    status_decisao_humana: str = Field(
        ...,
        pattern="^(ACEITO|MODIFICADO|REJEITADO)$",
        description="Deliberacao humana do dentista: ACEITO, MODIFICADO ou REJEITADO",
    )
    justificativa_rejeicao: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Motivo clinico apontado em caso de recusa ou alteracao da recomendacao",
    )
    procedimentos_confirmados: Optional[List[ToothProcedureSuggestion]] = Field(
        default=None,
        description="Procedimentos finais validados pelo dentista para gravacao definitiva",
    )


class AuditDecisionResponse(BaseModel):
    sucesso: bool
    mensagem: str
    id_auditoria_ia: int
    status_registrado: str
