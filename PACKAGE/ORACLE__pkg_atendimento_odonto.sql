CREATE OR REPLACE PACKAGE OWNER_ODONTO.PKG_ATENDIMENTO_ODONTO IS
    
    -- Procedure para realizar agendamento validando conflitos
    PROCEDURE PR_AGENDAR_CONSULTA (
        p_id_paciente IN NUMBER,
        p_id_dentista IN NUMBER,
        p_data_hora IN DATE,
        p_motivo IN VARCHAR2,
        p_observacao IN VARCHAR2,
        p_id_agendamento OUT NUMBER
    );

    -- Procedure para registrar o prontuario apos o atendimento
    PROCEDURE PR_REGISTRAR_PRONTUARIO (
        p_id_agendamento IN NUMBER,
        p_anamnese IN CLOB,
        p_descricao_clinica IN CLOB,
        p_id_procedimento IN NUMBER,
        p_valor_cobrado IN NUMBER,
        p_id_prontuario OUT NUMBER
    );

END PKG_ATENDIMENTO_ODONTO;
/
