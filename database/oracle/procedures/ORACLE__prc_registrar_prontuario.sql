CREATE OR REPLACE PROCEDURE OWNER_ODONTO.PRC_REGISTRAR_PRONTUARIO (
    p_id_agendamento IN NUMBER,
    p_anamnese IN CLOB,
    p_descricao_clinica IN CLOB,
    p_id_procedimento IN NUMBER,
    p_valor_cobrado IN NUMBER,
    p_id_prontuario OUT NUMBER
) IS
BEGIN
    -- Wrapper chamando a package central
    OWNER_ODONTO.PKG_ATENDIMENTO_ODONTO.PR_REGISTRAR_PRONTUARIO(
        p_id_agendamento,
        p_anamnese,
        p_descricao_clinica,
        p_id_procedimento,
        p_valor_cobrado,
        p_id_prontuario
    );
END PRC_REGISTRAR_PRONTUARIO;
/
