CREATE OR REPLACE PROCEDURE OWNER_ODONTO.PRC_AGENDAR_CONSULTA (
    p_id_paciente IN NUMBER,
    p_id_dentista IN NUMBER,
    p_data_hora IN DATE,
    p_motivo IN VARCHAR2,
    p_observacao IN VARCHAR2,
    p_id_agendamento OUT NUMBER
) IS
BEGIN
    -- Wrapper chamando a package central
    OWNER_ODONTO.PKG_ATENDIMENTO_ODONTO.PR_AGENDAR_CONSULTA(
        p_id_paciente,
        p_id_dentista,
        p_data_hora,
        p_motivo,
        p_observacao,
        p_id_agendamento
    );
END PRC_AGENDAR_CONSULTA;
/
