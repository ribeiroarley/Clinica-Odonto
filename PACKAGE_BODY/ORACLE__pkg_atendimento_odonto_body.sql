CREATE OR REPLACE PACKAGE BODY OWNER_ODONTO.PKG_ATENDIMENTO_ODONTO IS

    PROCEDURE PR_AGENDAR_CONSULTA (
        p_id_paciente IN NUMBER,
        p_id_dentista IN NUMBER,
        p_data_hora IN DATE,
        p_motivo IN VARCHAR2,
        p_observacao IN VARCHAR2,
        p_id_agendamento OUT NUMBER
    ) IS
        v_conflitos NUMBER;
    BEGIN
        -- Verifica se ja existe agendamento para o mesmo dentista em intervalo de 30 minutos
        SELECT COUNT(*)
        INTO v_conflitos
        FROM OWNER_ODONTO.AGENDAMENTOS
        WHERE ID_DENTISTA = p_id_dentista
          AND STATUS NOT IN ('CANCELADO')
          AND ABS(DATA_HORA_AGENDAMENTO - p_data_hora) < (30/1440); -- 30 minutos

        IF v_conflitos > 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Conflito de horario: O dentista ja possui consulta agendada neste horario.');
        END IF;

        INSERT INTO OWNER_ODONTO.AGENDAMENTOS (
            ID_PACIENTE, ID_DENTISTA, DATA_HORA_AGENDAMENTO, STATUS, MOTIVO_CONSULTA, OBSERVACAO
        ) VALUES (
            p_id_paciente, p_id_dentista, p_data_hora, 'AGENDADO', p_motivo, p_observacao
        ) RETURNING ID_AGENDAMENTO INTO p_id_agendamento;
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END PR_AGENDAR_CONSULTA;

    PROCEDURE PR_REGISTRAR_PRONTUARIO (
        p_id_agendamento IN NUMBER,
        p_anamnese IN CLOB,
        p_descricao_clinica IN CLOB,
        p_id_procedimento IN NUMBER,
        p_valor_cobrado IN NUMBER,
        p_id_prontuario OUT NUMBER
    ) IS
        v_id_paciente NUMBER;
        v_id_dentista NUMBER;
        v_status_agendamento VARCHAR2(20);
    BEGIN
        -- Recuperar os dados do agendamento
        SELECT ID_PACIENTE, ID_DENTISTA, STATUS
        INTO v_id_paciente, v_id_dentista, v_status_agendamento
        FROM OWNER_ODONTO.AGENDAMENTOS
        WHERE ID_AGENDAMENTO = p_id_agendamento;

        IF v_status_agendamento = 'CANCELADO' THEN
            RAISE_APPLICATION_ERROR(-20002, 'Nao e possivel registrar prontuario para um agendamento cancelado.');
        END IF;

        -- Insere o registro de prontuario
        INSERT INTO OWNER_ODONTO.PRONTUARIO_ELETRONICO (
            ID_AGENDAMENTO, ID_PACIENTE, ID_DENTISTA, ANAMNESE, DESCRICAO_CLINICA, ID_PROCEDIMENTO, VALOR_COBRADO
        ) VALUES (
            p_id_agendamento, v_id_paciente, v_id_dentista, p_anamnese, p_descricao_clinica, p_id_procedimento, p_valor_cobrado
        ) RETURNING ID_PRONTUARIO INTO p_id_prontuario;

        -- Atualiza o status do agendamento para REALIZADO
        UPDATE OWNER_ODONTO.AGENDAMENTOS
        SET STATUS = 'REALIZADO'
        WHERE ID_AGENDAMENTO = p_id_agendamento;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END PR_REGISTRAR_PRONTUARIO;

END PKG_ATENDIMENTO_ODONTO;
/
