# Fluxo de Aplicação - Clínica Odontológica

## 1. Cadastro e Recepção
- O(a) recepcionista cadastra os dados do paciente (`PACIENTES`) informando CPF, endereço, contato, data de nascimento.
- A clínica cadastra seus profissionais (`DENTISTAS`), informando CRO e associando-os a uma `ESPECIALIDADES` principal (ex: Clínico Geral, Ortodontia).

## 2. Agendamento
- O paciente solicita uma consulta. A recepção acessa a agenda, verifica a disponibilidade do dentista escolhido e cria um registro em `AGENDAMENTOS`.
- O status inicial do agendamento é `AGENDADO`.
- Próximo à data, a recepção pode mudar o status para `CONFIRMADO` ou `CANCELADO`.

## 3. Realização da Consulta (Prontuário)
- O paciente comparece à clínica (Status da consulta vai para `REALIZADO`).
- O dentista acessa o `PRONTUARIO_ELETRONICO`, vinculando o registro ao agendamento.
- O dentista preenche a `ANAMNESE` (histórico médico, alergias, queixas).
- O dentista registra os `PROCEDIMENTOS` realizados durante a consulta e insere a `DESCRICAO_CLINICA`.

## 4. Auditoria e Rastreabilidade
- Qualquer inserção, atualização ou deleção na tabela de prontuário é automaticamente auditada (`TRG_AUDITORIA_PRONTUARIO`).
- O sistema registra na tabela `HISTORICO_AUDITORIA` o usuário do banco de dados, a data/hora e o estado antigo/novo do registro (em formato JSON) para garantir segurança e compliance com dados médicos.
