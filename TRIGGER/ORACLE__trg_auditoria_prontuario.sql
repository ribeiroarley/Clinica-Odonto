CREATE OR REPLACE TRIGGER OWNER_ODONTO.TRG_AUDITORIA_PRONTUARIO
AFTER INSERT OR UPDATE OR DELETE ON OWNER_ODONTO.PRONTUARIO_ELETRONICO
FOR EACH ROW
DECLARE
    v_acao VARCHAR2(10);
    v_id_registro NUMBER;
    v_old_json CLOB;
    v_new_json CLOB;
BEGIN
    IF INSERTING THEN
        v_acao := 'INSERT';
        v_id_registro := :NEW.ID_PRONTUARIO;
        v_old_json := NULL;
        v_new_json := '{' ||
                      '"ID_PRONTUARIO": ' || :NEW.ID_PRONTUARIO || ', ' ||
                      '"ID_AGENDAMENTO": ' || :NEW.ID_AGENDAMENTO || ', ' ||
                      '"VALOR_COBRADO": ' || :NEW.VALOR_COBRADO || 
                      '}';
    ELSIF UPDATING THEN
        v_acao := 'UPDATE';
        v_id_registro := :NEW.ID_PRONTUARIO;
        v_old_json := '{' ||
                      '"ID_PRONTUARIO": ' || :OLD.ID_PRONTUARIO || ', ' ||
                      '"ID_AGENDAMENTO": ' || :OLD.ID_AGENDAMENTO || ', ' ||
                      '"VALOR_COBRADO": ' || :OLD.VALOR_COBRADO || 
                      '}';
        v_new_json := '{' ||
                      '"ID_PRONTUARIO": ' || :NEW.ID_PRONTUARIO || ', ' ||
                      '"ID_AGENDAMENTO": ' || :NEW.ID_AGENDAMENTO || ', ' ||
                      '"VALOR_COBRADO": ' || :NEW.VALOR_COBRADO || 
                      '}';
    ELSIF DELETING THEN
        v_acao := 'DELETE';
        v_id_registro := :OLD.ID_PRONTUARIO;
        v_old_json := '{' ||
                      '"ID_PRONTUARIO": ' || :OLD.ID_PRONTUARIO || ', ' ||
                      '"ID_AGENDAMENTO": ' || :OLD.ID_AGENDAMENTO || ', ' ||
                      '"VALOR_COBRADO": ' || :OLD.VALOR_COBRADO || 
                      '}';
        v_new_json := NULL;
    END IF;

    INSERT INTO OWNER_ODONTO.HISTORICO_AUDITORIA (
        ID_AUDITORIA, NOME_TABELA, ID_REGISTRO, ACAO, DATA_ACAO, USUARIO_DB, DADOS_ANTIGOS_JSON, DADOS_NOVOS_JSON
    ) VALUES (
        OWNER_ODONTO.SEQ_AUDITORIA.NEXTVAL,
        'PRONTUARIO_ELETRONICO',
        v_id_registro,
        v_acao,
        SYSDATE,
        SYS_CONTEXT('USERENV', 'SESSION_USER'),
        v_old_json,
        v_new_json
    );
END TRG_AUDITORIA_PRONTUARIO;
/
