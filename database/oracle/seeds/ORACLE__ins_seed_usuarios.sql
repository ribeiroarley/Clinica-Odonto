-- ==============================================================================
-- Seed de Usuarios com Senhas Hasheadas em Argon2id
-- Senha padrao: Odonto@2026
-- ==============================================================================

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'admin@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Dr. Roberto Carlos',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$0ro3ZuxdS0mpFQLAeO/d2w$1Mkp7CVZ119kBP1VHZBYTshZhvn1QEI1o/l8n1FpL1A',
             u.ROLE = 'ADMIN',
             u.CRO = NULL,
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Dr. Roberto Carlos', 'admin@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$0ro3ZuxdS0mpFQLAeO/d2w$1Mkp7CVZ119kBP1VHZBYTshZhvn1QEI1o/l8n1FpL1A', 'ADMIN', NULL, 'A', SYSDATE, SYSDATE);

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'dra.ana@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Dra. Ana Beatriz Silva',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$LgUgBGDs3bu3lvK+976Xsg$lbPzk2Z/a+KBtNSpbrCWGOHW7ZDzECLxJCKbV9ZA+Fg',
             u.ROLE = 'DENTISTA',
             u.CRO = 'CRO-SP-12345',
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Dra. Ana Beatriz Silva', 'dra.ana@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$LgUgBGDs3bu3lvK+976Xsg$lbPzk2Z/a+KBtNSpbrCWGOHW7ZDzECLxJCKbV9ZA+Fg', 'DENTISTA', 'CRO-SP-12345', 'A', SYSDATE, SYSDATE);

MERGE INTO OWNER_ODONTO.TB_USUARIOS u
USING (SELECT 'recepcao@clinica.com' AS email FROM dual) src
ON (LOWER(u.EMAIL) = LOWER(src.email))
WHEN MATCHED THEN
  UPDATE SET u.NOME = 'Mariana Costa',
             u.SENHA_HASH = '$argon2id$v=19$m=65536,t=3,p=4$g5Cydg4BoJSS0jpHCEFojQ$DmjfrrciPT24bajldOTuY/sNsY/ukIZhJK3physELfo',
             u.ROLE = 'RECEPCAO',
             u.CRO = NULL,
             u.STATUS = 'A',
             u.ATUALIZADO_EM = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (NOME, EMAIL, SENHA_HASH, ROLE, CRO, STATUS, CRIADO_EM, ATUALIZADO_EM)
  VALUES ('Mariana Costa', 'recepcao@clinica.com', '$argon2id$v=19$m=65536,t=3,p=4$g5Cydg4BoJSS0jpHCEFojQ$DmjfrrciPT24bajldOTuY/sNsY/ukIZhJK3physELfo', 'RECEPCAO', NULL, 'A', SYSDATE, SYSDATE);

COMMIT;
