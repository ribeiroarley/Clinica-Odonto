from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
import oracledb

from src.core.database import get_db_connection
from src.modules.auth.router import get_current_user
from src.modules.auth.schemas import TokenPayload
from src.modules.patients.schemas import (
    PatientCreate,
    PatientResponse,
    PatientListResponse,
)

router = APIRouter(prefix="/patients", tags=["Pacientes"])


@router.get("", response_model=PatientListResponse, summary="Listar pacientes com paginacao")
def list_patients(
    page: int = Query(1, ge=1, description="Numero da pagina"),
    page_size: int = Query(10, ge=1, le=100, description="Tamanho da pagina"),
    q: Optional[str] = Query(None, description="Busca por nome ou CPF"),
    conn: oracledb.Connection = Depends(get_db_connection),
    _: TokenPayload = Depends(get_current_user),
) -> PatientListResponse:
    """Retorna lista paginada de pacientes cadastrados na clinica."""
    cursor = conn.cursor()
    offset = (page - 1) * page_size

    where_clause = "WHERE STATUS = 'A'"
    params: dict = {"offset": offset, "limit": page_size}

    if q:
        clean_q = f"%{q.strip().lower()}%"
        where_clause += " AND (LOWER(NOME) LIKE :search OR CPF LIKE :search_cpf)"
        params["search"] = clean_q
        params["search_cpf"] = f"%{q.strip()}%"

    # Total de registros
    count_sql = f"SELECT COUNT(*) FROM OWNER_ODONTO.PACIENTES {where_clause}"
    cursor.execute(count_sql, {k: v for k, v in params.items() if k not in ("offset", "limit")})
    total = cursor.fetchone()[0]

    # Itens paginados
    query_sql = f"""
        SELECT ID_PACIENTE, NOME, CPF, DATA_NASCIMENTO, TELEFONE, EMAIL, ENDERECO, DATA_CADASTRO, STATUS,
               OWNER_ODONTO.FN_CALCULA_IDADE_PACIENTE(DATA_NASCIMENTO) AS IDADE
        FROM OWNER_ODONTO.PACIENTES
        {where_clause}
        ORDER BY DATA_CADASTRO DESC, ID_PACIENTE DESC
        OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    """
    cursor.execute(query_sql, params)
    rows = cursor.fetchall()

    items: List[PatientResponse] = []
    for r in rows:
        items.append(
            PatientResponse(
                id_paciente=r[0],
                nome=r[1],
                cpf=r[2],
                data_nascimento=r[3].date() if hasattr(r[3], "date") else r[3],
                telefone=r[4],
                email=r[5],
                endereco=r[6],
                data_cadastro=r[7],
                status=r[8],
                idade=r[9],
            )
        )

    return PatientListResponse(total=total, page=page, page_size=page_size, items=items)


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED, summary="Cadastrar novo paciente")
def create_patient(
    patient: PatientCreate,
    conn: oracledb.Connection = Depends(get_db_connection),
    _: TokenPayload = Depends(get_current_user),
) -> PatientResponse:
    """Cadastra um novo paciente validando unicidade de CPF na borda da aplicacao."""
    cursor = conn.cursor()

    # Verifica se CPF ja existe
    check_sql = "SELECT ID_PACIENTE FROM OWNER_ODONTO.PACIENTES WHERE CPF = :cpf"
    cursor.execute(check_sql, cpf=patient.cpf)
    if cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um paciente cadastrado com este CPF.",
        )

    # Insercao usando sequence OWNER_ODONTO.SEQ_PACIENTES
    id_paciente_var = cursor.var(oracledb.NUMBER)
    insert_sql = """
        INSERT INTO OWNER_ODONTO.PACIENTES (
            ID_PACIENTE, NOME, CPF, DATA_NASCIMENTO, TELEFONE, EMAIL, ENDERECO, STATUS
        ) VALUES (
            OWNER_ODONTO.SEQ_PACIENTES.NEXTVAL, :nome, :cpf, :data_nasc, :telefone, :email, :endereco, 'A'
        ) RETURNING ID_PACIENTE INTO :id_out
    """
    cursor.execute(
        insert_sql,
        nome=patient.name,
        cpf=patient.cpf,
        data_nasc=patient.birth_date,
        telefone=patient.phone,
        email=patient.email,
        endereco=patient.address,
        id_out=id_paciente_var,
    )
    new_id = int(id_paciente_var.getvalue()[0])

    # Recupera o registro persistido
    select_sql = """
        SELECT ID_PACIENTE, NOME, CPF, DATA_NASCIMENTO, TELEFONE, EMAIL, ENDERECO, DATA_CADASTRO, STATUS,
               OWNER_ODONTO.FN_CALCULA_IDADE_PACIENTE(DATA_NASCIMENTO) AS IDADE
        FROM OWNER_ODONTO.PACIENTES
        WHERE ID_PACIENTE = :id
    """
    cursor.execute(select_sql, id=new_id)
    r = cursor.fetchone()

    return PatientResponse(
        id_paciente=r[0],
        nome=r[1],
        cpf=r[2],
        data_nascimento=r[3].date() if hasattr(r[3], "date") else r[3],
        telefone=r[4],
        email=r[5],
        endereco=r[6],
        data_cadastro=r[7],
        status=r[8],
        idade=r[9],
    )


@router.get("/{patient_id}", response_model=PatientResponse, summary="Obter dados de um paciente")
def get_patient_by_id(
    patient_id: int,
    conn: oracledb.Connection = Depends(get_db_connection),
    _: TokenPayload = Depends(get_current_user),
) -> PatientResponse:
    """Busca os dados cadastrais detalhados do paciente."""
    cursor = conn.cursor()
    select_sql = """
        SELECT ID_PACIENTE, NOME, CPF, DATA_NASCIMENTO, TELEFONE, EMAIL, ENDERECO, DATA_CADASTRO, STATUS,
               OWNER_ODONTO.FN_CALCULA_IDADE_PACIENTE(DATA_NASCIMENTO) AS IDADE
        FROM OWNER_ODONTO.PACIENTES
        WHERE ID_PACIENTE = :id
    """
    cursor.execute(select_sql, id=patient_id)
    r = cursor.fetchone()
    if not r:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paciente ID {patient_id} nao encontrado.",
        )

    return PatientResponse(
        id_paciente=r[0],
        nome=r[1],
        cpf=r[2],
        data_nascimento=r[3].date() if hasattr(r[3], "date") else r[3],
        telefone=r[4],
        email=r[5],
        endereco=r[6],
        data_cadastro=r[7],
        status=r[8],
        idade=r[9],
    )
