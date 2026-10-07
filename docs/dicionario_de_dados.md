# Dicionário de Dados - Clínica Odontológica
(Schema: `OWNER_ODONTO`)

## 1. Tabela: ESPECIALIDADES
Armazena as especialidades odontológicas disponíveis na clínica.
- `ID_ESPECIALIDADE` (NUMBER, PK): Identificador único.
- `NOME_ESPECIALIDADE` (VARCHAR2): Nome (ex: Ortodontia, Endodontia).
- `DESCRICAO` (VARCHAR2): Breve descrição.
- `STATUS` (VARCHAR2): Ativo/Inativo (A/I).

## 2. Tabela: DENTISTAS
Registra os profissionais de odontologia da clínica.
- `ID_DENTISTA` (NUMBER, PK): Identificador único.
- `NOME` (VARCHAR2): Nome completo do dentista.
- `CRO` (VARCHAR2, UNIQUE): Conselho Regional de Odontologia.
- `CPF` (VARCHAR2, UNIQUE): Documento de pessoa física.
- `ID_ESPECIALIDADE_PRINCIPAL` (NUMBER, FK): Relacionamento com ESPECIALIDADES.
- `TELEFONE`, `EMAIL` (VARCHAR2): Contatos.
- `STATUS` (VARCHAR2): Ativo/Inativo (A/I).

## 3. Tabela: PACIENTES
Informações dos clientes/pacientes.
- `ID_PACIENTE` (NUMBER, PK): Identificador único.
- `NOME` (VARCHAR2): Nome completo.
- `CPF` (VARCHAR2, UNIQUE): Documento, validado via função PL/SQL.
- `DATA_NASCIMENTO` (DATE): Data de nascimento.
- `TELEFONE`, `EMAIL`, `ENDERECO` (VARCHAR2): Dados de contato e endereço.
- `DATA_CADASTRO` (DATE): Data em que o paciente foi registrado no sistema.
- `STATUS` (VARCHAR2): Ativo/Inativo (A/I).

## 4. Tabela: PROCEDIMENTOS
Catálogo de serviços e tratamentos.
- `ID_PROCEDIMENTO` (NUMBER, PK): Identificador único.
- `NOME_PROCEDIMENTO` (VARCHAR2): Nome do procedimento.
- `DESCRICAO` (VARCHAR2): Detalhamento do que é feito.
- `VALOR_BASE` (NUMBER): Preço padrão de tabela.
- `ID_ESPECIALIDADE` (NUMBER, FK): Especialidade relacionada.
- `STATUS` (VARCHAR2): Ativo/Inativo (A/I).

## 5. Tabela: AGENDAMENTOS
Controle de agenda, horários e vínculo dentista/paciente.
- `ID_AGENDAMENTO` (NUMBER, PK): Identificador único.
- `ID_PACIENTE` (NUMBER, FK): Relacionamento com PACIENTES.
- `ID_DENTISTA` (NUMBER, FK): Relacionamento com DENTISTAS.
- `DATA_HORA_AGENDAMENTO` (DATE): Dia e hora da consulta.
- `STATUS` (VARCHAR2): AGENDADO, CONFIRMADO, CANCELADO, REALIZADO.
- `MOTIVO_CONSULTA` (VARCHAR2): Descrição breve do motivo.
- `OBSERVACAO` (VARCHAR2): Notas extras da recepção.

## 6. Tabela: PRONTUARIO_ELETRONICO
Histórico clínico executado durante as consultas.
- `ID_PRONTUARIO` (NUMBER, PK): Identificador único.
- `ID_AGENDAMENTO` (NUMBER, FK, UNIQUE): Vínculo com a consulta de origem.
- `ID_PACIENTE` (NUMBER, FK): Redundância controlada/vínculo direto para relatórios rápidos.
- `ID_DENTISTA` (NUMBER, FK): Profissional que atendeu.
- `DATA_REGISTRO` (DATE): Momento do atendimento.
- `ANAMNESE` (CLOB): Condições de saúde relatadas pelo paciente.
- `DESCRICAO_CLINICA` (CLOB): O que foi observado/feito.
- `ID_PROCEDIMENTO` (NUMBER, FK): Procedimento principal realizado (para simplificar, 1:1 nesta modelagem).
- `VALOR_COBRADO` (NUMBER): Valor final acordado.

## 7. Tabela: HISTORICO_AUDITORIA
Tabela de logs rastreáveis, preenchida via Triggers.
- `ID_AUDITORIA` (NUMBER, PK): Identificador da linha de log.
- `NOME_TABELA` (VARCHAR2): Tabela auditada.
- `ID_REGISTRO` (NUMBER): PK do registro modificado.
- `ACAO` (VARCHAR2): INSERT, UPDATE, DELETE.
- `DATA_ACAO` (DATE): Quando ocorreu.
- `USUARIO_DB` (VARCHAR2): `USER` ou `SYS_CONTEXT` do Oracle.
- `DADOS_ANTIGOS_JSON` (CLOB): Snapshot em JSON do dado antes da mudança.
- `DADOS_NOVOS_JSON` (CLOB): Snapshot em JSON do dado após a mudança.
