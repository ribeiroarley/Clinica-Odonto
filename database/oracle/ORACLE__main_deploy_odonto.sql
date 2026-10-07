-- ==============================================================================
-- Script Mestre de Deploy - Clinica Odontologica
-- Owner: OWNER_ODONTO
-- ==============================================================================

-- 1. Sequences
@@sequences/ORACLE__seq_especialidades.sql
@@sequences/ORACLE__seq_dentistas.sql
@@sequences/ORACLE__seq_pacientes.sql
@@sequences/ORACLE__seq_procedimentos.sql
@@sequences/ORACLE__seq_agendamentos.sql
@@sequences/ORACLE__seq_prontuario.sql
@@sequences/ORACLE__seq_auditoria.sql

-- 2. Tables
@@tables/ORACLE__tb_especialidades.sql
@@tables/ORACLE__tb_dentistas.sql
@@tables/ORACLE__tb_pacientes.sql
@@tables/ORACLE__tb_procedimentos.sql
@@tables/ORACLE__tb_agendamentos.sql
@@tables/ORACLE__tb_prontuario.sql
@@tables/ORACLE__tb_auditoria.sql
@@tables/ORACLE__tb_odontograma.sql
@@tables/ORACLE__tb_odontograma_procedimentos.sql
@@tables/ORACLE__tb_usuarios.sql

-- 3. Indexes
@@indexes/ORACLE__idx_pacientes_cpf.sql
@@indexes/ORACLE__idx_agendamentos_data.sql
@@indexes/ORACLE__idx_dentistas_cro.sql
@@indexes/ORACLE__idx_odontograma.sql

-- 4. Functions
@@functions/ORACLE__fn_valida_cpf.sql
@@functions/ORACLE__fn_calcula_idade_paciente.sql

-- 5. Packages Spec
@@packages/ORACLE__pkg_atendimento_odonto.sql

-- 6. Packages Body
@@packages/ORACLE__pkg_atendimento_odonto_body.sql

-- 7. Procedures Standalone
@@procedures/ORACLE__prc_agendar_consulta.sql
@@procedures/ORACLE__prc_registrar_prontuario.sql

-- 8. Triggers
@@triggers/ORACLE__trg_pacientes_biu.sql
@@triggers/ORACLE__trg_auditoria_prontuario.sql
@@triggers/ORACLE__trg_bloqueia_delete_auditoria.sql

-- 9. Views
@@views/ORACLE__vw_agenda_diaria_dentista.sql
@@views/ORACLE__vw_historico_prontuario_paciente.sql
@@views/ORACLE__vw_procedimentos_mais_realizados.sql

-- 10. Synonyms
@@synonyms/ORACLE__syn_odonto_objects.sql

-- 11. Grants
@@grants/ORACLE__grants_odonto.sql

-- 12. DML (Carga Inicial)
@@seeds/ORACLE__ins_seed_data.sql
@@seeds/ORACLE__upd_seed_data.sql
@@seeds/ORACLE__ins_seed_usuarios.sql

PROMPT Deploy finalizado com sucesso!
