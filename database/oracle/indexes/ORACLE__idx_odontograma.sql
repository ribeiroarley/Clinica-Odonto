-- ==============================================================================
-- Indices para Performance do Modulo de Odontograma (Padrao FDI)
-- Owner: OWNER_ODONTO
-- ==============================================================================

-- Indice cobridor composto para consultas rapidas de ficha por paciente (Idempotente)
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX OWNER_ODONTO.IDX_ODONTO_PACIENTE_DENTE ON OWNER_ODONTO.ODONTOGRAMA (ID_PACIENTE, NUMERO_DENTE)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1408, -955) THEN
            NULL;
        ELSE
            RAISE;
        END IF;
END;
/

-- Indice para carregar historico de procedimentos de um dente (Idempotente)
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX OWNER_ODONTO.IDX_ODONTO_PROC_DENTE ON OWNER_ODONTO.ODONTOGRAMA_PROCEDIMENTOS (ID_ODONTOGRAMA, ID_PRONTUARIO)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1408, -955) THEN
            NULL;
        ELSE
            RAISE;
        END IF;
END;
/
