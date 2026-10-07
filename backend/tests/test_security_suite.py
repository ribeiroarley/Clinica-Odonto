"""
Bateria de Testes Automatizados de Seguranca & Compliance LGPD
Projeto: Clinica-Odonto
Skills: clinical-appsec-guard & OWASP Top 10
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
import oracledb

# Garante path para importacoes do backend
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from src.main import app
from src.core.config import settings
from src.modules.auth.service import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from src.shared.sanitizer import sanitize_clinical_text


# ==============================================================================
# 1. CAMADA DE BANCO ORACLE 23ai - COMPLIANCE LGPD & AUDITORIA IMUTAVEL
# ==============================================================================

def test_oracle_audit_trigger_blocks_delete_and_update():
    """
    Comprova que o trigger TRG_BLOQUEIA_DELETE_AUDITORIA impede fisicamente
    exclusoes e alteracoes na tabela HISTORICO_AUDITORIA emitindo ORA-20099.
    """
    dsn = f"{settings.ORACLE_HOST}:{settings.ORACLE_PORT}/{settings.APP_DB_SERVICE}"
    conn = oracledb.connect(
        user=settings.APP_DB_USER,
        password=settings.APP_DB_PASSWORD,
        dsn=dsn,
    )
    cursor = conn.cursor()

    try:
        # 1. Insere registro legitimo de auditoria
        id_var = cursor.var(int)
        insert_sql = """
            INSERT INTO OWNER_ODONTO.HISTORICO_AUDITORIA (
                ID_AUDITORIA, NOME_TABELA, ID_REGISTRO, ACAO, DATA_ACAO, USUARIO_DB
            ) VALUES (
                OWNER_ODONTO.SEQ_AUDITORIA.NEXTVAL, 'TEST_LGPD_COMPLIANCE', 1234, 'INSERT', SYSDATE, 'QA_APPSEC'
            ) RETURNING ID_AUDITORIA INTO :id_out
        """
        cursor.execute(insert_sql, id_out=id_var)
        conn.commit()
        inserted_id = id_var.getvalue()[0]
        assert inserted_id is not None, "Falha ao inserir registro de teste de auditoria."

        # 2. Testa Bloqueio de DELETE -> Deve disparar ORA-20099
        with pytest.raises(oracledb.DatabaseError) as exc_info_del:
            cursor.execute(
                "DELETE FROM OWNER_ODONTO.HISTORICO_AUDITORIA WHERE ID_AUDITORIA = :id",
                id=inserted_id,
            )
        error_del = str(exc_info_del.value)
        assert "ORA-20099" in error_del, f"DELETE nao disparou ORA-20099: {error_del}"
        assert "Violacao de Compliance" in error_del

        # 3. Testa Bloqueio de UPDATE -> Deve disparar ORA-20099
        with pytest.raises(oracledb.DatabaseError) as exc_info_upd:
            cursor.execute(
                "UPDATE OWNER_ODONTO.HISTORICO_AUDITORIA SET ACAO = 'FRAUD' WHERE ID_AUDITORIA = :id",
                id=inserted_id,
            )
        error_upd = str(exc_info_upd.value)
        assert "ORA-20099" in error_upd, f"UPDATE nao disparou ORA-20099: {error_upd}"
        assert "Violacao de Compliance" in error_upd

    finally:
        cursor.close()
        conn.close()


# ==============================================================================
# 2. CAMADA DE API (FastAPI) - HASHING ARGON2id
# ==============================================================================

def test_password_hashing_uses_strict_argon2id():
    """
    Valida que senhas sao cifradas estritamente no algoritmo Argon2id
    conforme recomendacao do OWASP Password Storage Cheat Sheet.
    """
    raw_password = "SenhaForte@Odonto2026"
    pwd_hash = get_password_hash(raw_password)

    # Identificador padrao do Argon2id RFC 9106
    assert pwd_hash.startswith("$argon2id$v=19$"), f"Hash nao e Argon2id: {pwd_hash}"
    assert verify_password(raw_password, pwd_hash) is True
    assert verify_password("SenhaErrada#999", pwd_hash) is False


# ==============================================================================
# 3. CAMADA DE API - RATE LIMITING CONTRA FORCA BRUTA (SLOWAPI)
# ==============================================================================

def test_login_rate_limiting_slowapi_returns_429():
    """
    Dispara multiplas tentativas invalidas contra POST /api/v1/auth/login
    e comprova que o rate limit de 5 req/min do SlowAPI retorna HTTP 429.
    """
    client = TestClient(app)
    endpoint = "/api/v1/auth/login"
    login_payload = {
        "username": "ataque_bruteforce@clinica.com",
        "password": "SenhaIncorreta123",
    }

    # Executa 5 requisicoes (limite maximo por minuto)
    statuses = []
    for _ in range(5):
        res = client.post(endpoint, json=login_payload)
        statuses.append(res.status_code)

    # A partir da 6a tentativa dentro da janela, o SlowAPI deve bloquear com HTTP 429
    res_bloqueado = client.post(endpoint, json=login_payload)
    assert res_bloqueado.status_code == 429, (
        f"Esperado HTTP 429 na 6a tentativa, recebido: {res_bloqueado.status_code}"
    )


# ==============================================================================
# 4. CAMADA DE API - SANITIZACAO DE TEXTO CLINICO CONTRA XSS (BLEACH)
# ==============================================================================

def test_clinical_text_sanitization_removes_xss_vectors():
    """
    Garante que tags HTML perigosas, scripts e manipuladores de eventos
    sejam neutralizados antes de atingir a base de dados.
    """
    # Vetor 1: Script injection
    payload_script = "<script>alert('XSS_ATTACK')</script>Paciente relata dor intensa."
    clean_1 = sanitize_clinical_text(payload_script)
    assert clean_1 == "Paciente relata dor intensa."
    assert "<script>" not in clean_1

    # Vetor 2: Event Handler (onerror / onload)
    payload_handler = "Cárie profunda no dente 16 <img src=invalid onerror=alert(document.cookie)>."
    clean_2 = sanitize_clinical_text(payload_handler)
    assert "onerror" not in clean_2
    assert "<img" not in clean_2
    assert "Cárie profunda no dente 16 ." in clean_2

    # Vetor 3: SVG inline com payload
    payload_svg = "<svg onload=javascript:stealTokens()>Gengivite marginal</svg>"
    clean_3 = sanitize_clinical_text(payload_svg)
    assert "onload" not in clean_3
    assert "<svg" not in clean_3
    assert clean_3 == "Gengivite marginal"


# ==============================================================================
# 5. CAMADA DE API - CONTROLE DE ACESSO BASEADO EM PAPEIS (RBAC) & LGPD
# ==============================================================================

def test_receptionist_cannot_write_odontogram_returns_403_forbidden():
    """
    Comprova que um token emitido para o perfil RECEPCAO e bloqueado
    com HTTP 403 ao tentar registrar procedimento no odontograma clinico.
    """
    client = TestClient(app)

    # 1. Cria token assinado com role RECEPCAO
    token_recepcao = create_access_token({
        "sub": "recepcao@clinica.com",
        "user_id": 3,
        "name": "Mariana Costa",
        "role": "RECEPCAO",
    })

    headers = {"Authorization": f"Bearer {token_recepcao}"}
    procedure_payload = {
        "id_paciente": 1,
        "numero_dente": 16,
        "face_dente": "O",
        "estado_face": "CARIE",
        "id_procedimento": 1,
        "valor_aplicado": 180.0,
    }

    response = client.post(
        "/api/v1/odontogram/procedure",
        json=procedure_payload,
        headers=headers,
    )

    assert response.status_code == 403, (
        f"Esperado HTTP 403 Forbidden para RECEPCAO, recebido: {response.status_code}"
    )
    detail = response.json().get("detail", "")
    assert "Acesso negado" in detail or "DENTISTA" in detail
