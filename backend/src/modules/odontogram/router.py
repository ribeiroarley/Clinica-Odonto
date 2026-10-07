from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
import oracledb

from src.core.database import get_db_connection
from src.modules.auth.router import get_current_user, RoleChecker
from src.modules.auth.schemas import TokenPayload
from src.modules.odontogram.schemas import (
    OdontogramProcedureCreate,
    OdontogramProcedureResponse,
    PatientOdontogramResponse,
    ToothStateResponse,
    ToothFaceProcedureResponse,
)

router = APIRouter(prefix="/odontogram", tags=["Odontograma FDI"])

# Apenas dentistas e administradores podem visualizar o odontograma
clinical_read_guard = RoleChecker(allowed_roles=["ADMIN", "DENTISTA"])

# Estritamente DENTISTA para gravacao de procedimentos clinicos no odontograma (LGPD e CFM/CFO Compliance)
dentist_write_guard = RoleChecker(allowed_roles=["DENTISTA"])


@router.get(
    "/patient/{patient_id}",
    response_model=PatientOdontogramResponse,
    summary="Consultar odontograma completo do paciente",
)
def get_patient_odontogram(
    patient_id: int,
    _: TokenPayload = Depends(clinical_read_guard),
    conn: oracledb.Connection = Depends(get_db_connection),
) -> PatientOdontogramResponse:
    """
    Retorna todos os dentes mapeados do paciente com suas respectivas faces e procedimentos realizados.
    """
    cursor = conn.cursor()

    # Valida existencia do paciente
    cursor.execute("SELECT NOME FROM OWNER_ODONTO.PACIENTES WHERE ID_PACIENTE = :id", id=patient_id)
    p_row = cursor.fetchone()
    if not p_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paciente ID {patient_id} nao encontrado.",
        )
    nome_paciente: str = p_row[0]

    # Busca dentes mapeados
    teeth_sql = """
        SELECT ID_ODONTOGRAMA, ID_PACIENTE, NUMERO_DENTE, STATUS_GERAL, OBSERVACOES, DATA_ATUALIZACAO
        FROM OWNER_ODONTO.ODONTOGRAMA
        WHERE ID_PACIENTE = :id
        ORDER BY NUMERO_DENTE ASC
    """
    cursor.execute(teeth_sql, id=patient_id)
    teeth_rows = cursor.fetchall()

    teeth_dict: Dict[int, ToothStateResponse] = {}
    for tr in teeth_rows:
        id_odonto, _, num_dente, status_geral, obs, dt_atualizacao = tr
        teeth_dict[id_odonto] = ToothStateResponse(
            id_odontograma=id_odonto,
            id_paciente=patient_id,
            numero_dente=num_dente,
            status_geral=status_geral,
            observacoes=obs,
            data_atualizacao=dt_atualizacao,
            procedimentos=[],
        )

    # Se existem dentes registrados, busca os procedimentos de cada dente/face
    if teeth_dict:
        proc_sql = """
            SELECT op.ID_ODONTO_PROC, op.ID_ODONTOGRAMA, op.ID_PRONTUARIO, op.ID_PROCEDIMENTO,
                   pr.NOME_PROCEDIMENTO, op.FACE_DENTE, op.ESTADO_FACE, op.VALOR_APLICADO, op.DATA_REGISTRO
            FROM OWNER_ODONTO.ODONTOGRAMA_PROCEDIMENTOS op
            JOIN OWNER_ODONTO.PROCEDIMENTOS pr ON op.ID_PROCEDIMENTO = pr.ID_PROCEDIMENTO
            WHERE op.ID_ODONTOGRAMA IN (
                SELECT ID_ODONTOGRAMA FROM OWNER_ODONTO.ODONTOGRAMA WHERE ID_PACIENTE = :id
            )
            ORDER BY op.DATA_REGISTRO DESC
        """
        cursor.execute(proc_sql, id=patient_id)
        proc_rows = cursor.fetchall()
        for pr in proc_rows:
            id_proc_reg, id_odonto_ref, id_pront, id_proc, nome_proc, face, estado, valor, dt_reg = pr
            if id_odonto_ref in teeth_dict:
                teeth_dict[id_odonto_ref].procedimentos.append(
                    ToothFaceProcedureResponse(
                        id_odonto_proc=id_proc_reg,
                        id_prontuario=id_pront,
                        id_procedimento=id_proc,
                        nome_procedimento=nome_proc,
                        face_dente=face,
                        estado_face=estado,
                        valor_aplicado=float(valor) if valor is not None else None,
                        data_registro=dt_reg,
                    )
                )

    teeth_list = list(teeth_dict.values())
    return PatientOdontogramResponse(
        id_paciente=patient_id,
        nome_paciente=nome_paciente,
        total_dentes_registrados=len(teeth_list),
        dentes=teeth_list,
    )


@router.post(
    "/procedure",
    response_model=OdontogramProcedureResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar procedimento em face ou dente do odontograma",
)
def add_odontogram_procedure(
    proc_in: OdontogramProcedureCreate,
    _: TokenPayload = Depends(dentist_write_guard),
    conn: oracledb.Connection = Depends(get_db_connection),
) -> OdontogramProcedureResponse:
    """
    Adiciona uma patologia ou procedimento restaurador em uma face ou dente,
    gerando o registro do dente caso seja a primeira intervencao no paciente.
    """
    cursor = conn.cursor()

    # 1. Verifica se o procedimento base existe no catalogo
    cursor.execute("SELECT ID_PROCEDIMENTO FROM OWNER_ODONTO.PROCEDIMENTOS WHERE ID_PROCEDIMENTO = :id", id=proc_in.id_procedimento)
    if not cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Procedimento de catalogo ID {proc_in.id_procedimento} nao encontrado.",
        )

    # 2. Localiza ou cria o dente no odontograma do paciente
    find_tooth_sql = """
        SELECT ID_ODONTOGRAMA, STATUS_GERAL
        FROM OWNER_ODONTO.ODONTOGRAMA
        WHERE ID_PACIENTE = :id_pac AND NUMERO_DENTE = :dente
    """
    cursor.execute(find_tooth_sql, id_pac=proc_in.id_paciente, dente=proc_in.numero_dente)
    tooth_row = cursor.fetchone()

    status_geral = proc_in.status_geral_novo or "EM_TRATAMENTO"

    if tooth_row:
        id_odontograma = tooth_row[0]
        # Atualiza o status geral do dente se solicitado
        if proc_in.status_geral_novo:
            cursor.execute(
                """
                UPDATE OWNER_ODONTO.ODONTOGRAMA
                SET STATUS_GERAL = :status_novo,
                    OBSERVACOES = COALESCE(:obs, OBSERVACOES),
                    DATA_ATUALIZACAO = SYSDATE
                WHERE ID_ODONTOGRAMA = :id_odonto
                """,
                status_novo=proc_in.status_geral_novo,
                obs=proc_in.observacoes,
                id_odonto=id_odontograma,
            )
    else:
        # Cria registro do dente
        id_odonto_var = cursor.var(oracledb.NUMBER)
        insert_tooth_sql = """
            INSERT INTO OWNER_ODONTO.ODONTOGRAMA (
                ID_PACIENTE, NUMERO_DENTE, STATUS_GERAL, OBSERVACOES, DATA_ATUALIZACAO
            ) VALUES (
                :id_pac, :dente, :status_geral, :obs, SYSDATE
            ) RETURNING ID_ODONTOGRAMA INTO :id_out
        """
        cursor.execute(
            insert_tooth_sql,
            id_pac=proc_in.id_paciente,
            dente=proc_in.numero_dente,
            status_geral=status_geral,
            obs=proc_in.observacoes,
            id_out=id_odonto_var,
        )
        id_odontograma = int(id_odonto_var.getvalue()[0])

    # 3. Insere a intervencao na tabela OWNER_ODONTO.ODONTOGRAMA_PROCEDIMENTOS
    id_proc_var = cursor.var(oracledb.NUMBER)
    insert_proc_sql = """
        INSERT INTO OWNER_ODONTO.ODONTOGRAMA_PROCEDIMENTOS (
            ID_ODONTOGRAMA, ID_PRONTUARIO, ID_PROCEDIMENTO, FACE_DENTE, ESTADO_FACE, VALOR_APLICADO, DATA_REGISTRO
        ) VALUES (
            :id_odonto, :id_pront, :id_proced, :face, :estado, :valor, SYSDATE
        ) RETURNING ID_ODONTO_PROC INTO :id_out
    """
    cursor.execute(
        insert_proc_sql,
        id_odonto=id_odontograma,
        id_pront=proc_in.id_prontuario,
        id_proced=proc_in.id_procedimento,
        face=proc_in.face_dente,
        estado=proc_in.estado_face,
        valor=proc_in.valor_aplicado,
        id_out=id_proc_var,
    )
    new_proc_id = int(id_proc_var.getvalue()[0])

    # Recupera data de registro
    cursor.execute(
        "SELECT DATA_REGISTRO FROM OWNER_ODONTO.ODONTOGRAMA_PROCEDIMENTOS WHERE ID_ODONTO_PROC = :id",
        id=new_proc_id,
    )
    data_reg = cursor.fetchone()[0]

    return OdontogramProcedureResponse(
        id_odonto_proc=new_proc_id,
        id_odontograma=id_odontograma,
        id_paciente=proc_in.id_paciente,
        numero_dente=proc_in.numero_dente,
        face_dente=proc_in.face_dente,
        estado_face=proc_in.estado_face,
        valor_aplicado=proc_in.valor_aplicado,
        data_registro=data_reg,
        mensagem=f"Procedimento registrado com sucesso no dente {proc_in.numero_dente} (Face: {proc_in.face_dente}).",
    )
