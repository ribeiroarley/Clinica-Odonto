-- Criacao idempotente do indice: ignora caso a coluna ja esteja indexada por constraint UNIQUE (ORA-01408)
-- ou se o objeto com este nome ja existir (ORA-00955)
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX OWNER_ODONTO.IDX_DENTISTAS_CRO ON OWNER_ODONTO.DENTISTAS (CRO)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE IN (-1408, -955) THEN
            NULL;
        ELSE
            RAISE;
        END IF;
END;
/
