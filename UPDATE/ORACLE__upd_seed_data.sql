-- Script demonstrativo de atualizacao
-- Alterando valor base de um procedimento
UPDATE OWNER_ODONTO.PROCEDIMENTOS
SET VALOR_BASE = 160.00
WHERE NOME_PROCEDIMENTO = 'Manutencao Aparelho';

-- Inativando um paciente
UPDATE OWNER_ODONTO.PACIENTES
SET STATUS = 'I'
WHERE CPF = '12345678901';

COMMIT;
