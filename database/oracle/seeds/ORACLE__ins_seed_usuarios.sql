-- ==============================================================================
-- Seed de Usuarios com Senhas Hasheadas em Argon2id
-- Senha padrao: Odonto@2026
-- ==============================================================================

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'admin@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Dr. Roberto Carlos',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$hjAmpBQCYAzhPMd4DyGE0A$ZEcjtRkLhtXboCmkPJqF//UzJ10jb1sZEZ2+xk2c2vo',
             u.ROLE = 'ADMIN',
             u.CRO = NULL,
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Dr. Roberto Carlos', 'admin@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$hjAmpBQCYAzhPMd4DyGE0A$ZEcjtRkLhtXboCmkPJqF//UzJ10jb1sZEZ2+xk2c2vo', 'ADMIN', NULL, 'A', SYSDATE, SYSDATE);

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'dra.ana@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Dra. Ana Beatriz Silva',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$KaU05vxfSwkhZAzhXEvp3Q$/mcCmQ2guQQWRtLHDOID+18gw1MvU56stLO8yfq3meY',
             u.ROLE = 'DENTISTA',
             u.CRO = 'CRO-SP-12345',
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Dra. Ana Beatriz Silva', 'dra.ana@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$KaU05vxfSwkhZAzhXEvp3Q$/mcCmQ2guQQWRtLHDOID+18gw1MvU56stLO8yfq3meY', 'DENTISTA', 'CRO-SP-12345', 'A', SYSDATE, SYSDATE);

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'recepcao@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Mariana Costa',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$ppRyrvX+X2uttbZWSun9/w$6pNGX/9fS3jD5ll49wT+H/5qASjOlE+A6yJpZtVpezY',
             u.ROLE = 'RECEPCAO',
             u.CRO = NULL,
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Mariana Costa', 'recepcao@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$ppRyrvX+X2uttbZWSun9/w$6pNGX/9fS3jD5ll49wT+H/5qASjOlE+A6yJpZtVpezY', 'RECEPCAO', NULL, 'A', SYSDATE, SYSDATE);

COMMIT;
