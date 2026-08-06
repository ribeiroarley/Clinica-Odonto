-- ==============================================================================
-- Script Mestre de Deploy - Clinica Odontologica
-- Owner: OWNER_ODONTO
-- ==============================================================================

-- 1. Sequences
@@SEQUENCE/ORACLE__seq_especialidades.sql
@@SEQUENCE/ORACLE__seq_dentistas.sql
@@SEQUENCE/ORACLE__seq_pacientes.sql
@@SEQUENCE/ORACLE__seq_procedimentos.sql
@@SEQUENCE/ORACLE__seq_agendamentos.sql
@@SEQUENCE/ORACLE__seq_prontuario.sql
@@SEQUENCE/ORACLE__seq_auditoria.sql

-- 2. Tables
@@TABLES/ORACLE__tb_especialidades.sql
@@TABLES/ORACLE__tb_dentistas.sql
@@TABLES/ORACLE__tb_pacientes.sql
@@TABLES/ORACLE__tb_procedimentos.sql
@@TABLES/ORACLE__tb_agendamentos.sql
@@TABLES/ORACLE__tb_prontuario.sql
@@TABLES/ORACLE__tb_auditoria.sql

-- 3. Indexes
@@INDEX/ORACLE__idx_pacientes_cpf.sql
@@INDEX/ORACLE__idx_agendamentos_data.sql
@@INDEX/ORACLE__idx_dentistas_cro.sql

-- 4. Functions
@@FUNCTION/ORACLE__fn_valida_cpf.sql
@@FUNCTION/ORACLE__fn_calcula_idade_paciente.sql

-- 5. Packages Spec
@@PACKAGE/ORACLE__pkg_atendimento_odonto.sql

-- 6. Packages Body
@@PACKAGE_BODY/ORACLE__pkg_atendimento_odonto_body.sql

-- 7. Procedures Standalone
@@PROCEDURE/ORACLE__prc_agendar_consulta.sql
@@PROCEDURE/ORACLE__prc_registrar_prontuario.sql

-- 8. Triggers
@@TRIGGER/ORACLE__trg_pacientes_biu.sql
@@TRIGGER/ORACLE__trg_auditoria_prontuario.sql

-- 9. Views
@@VIEW/ORACLE__vw_agenda_diaria_dentista.sql
@@VIEW/ORACLE__vw_historico_prontuario_paciente.sql
@@VIEW/ORACLE__vw_procedimentos_mais_realizados.sql

-- 10. Synonyms
@@SYNONYMS/ORACLE__syn_odonto_objects.sql

-- 11. Grants
@@GRANTS/ORACLE__grants_odonto.sql

-- 12. DML (Carga Inicial)
@@INSERT/ORACLE__ins_seed_data.sql
@@UPDATE/ORACLE__upd_seed_data.sql

PROMPT Deploy finalizado com sucesso!
