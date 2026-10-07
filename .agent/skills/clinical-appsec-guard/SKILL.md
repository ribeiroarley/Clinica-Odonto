---
name: clinical-appsec-guard
description: Regras mandatarias de ciberseguranca, compliance LGPD (dados sensiveis de saude) e protecao OWASP para o sistema clinico odontologico.
---

# Clinical AppSec & LGPD Guard Skill

Esta skill define as politicas inegociaveis de seguranca da informacao e protecao de dados para o projeto **Clinica-Odonto**.

## 1. Compliance LGPD (Lei 13.709/2018 - Art. 5º, Inciso II)
- **Classificacao de Dados:** Informacoes de prontuario, anamnese, condicoes dentarias e historico clinico sao categorizadas como **Dados Pessoais Sensiveis**.
- **Principio da Necessidade e Acesso Minimo (RBAC):**
  - **DENTISTA:** Acesso completo a ficha clinica, anamnese e edicao de odontograma.
  - **RECEPCAO:** Acesso restrito a cadastro basico (nome, telefone, CPF) e status de agendamentos. Bloqueio absoluto a historico medico e detalhes de procedimentos de prontuario.
  - **ADMIN:** Gestao operacional e financeira; sem alteracao arbitraria de registros clinicos passados.
- **Imutabilidade e Trilha de Auditoria:**
  - Registros de prontuario finalizados e historicos de auditoria NUNCA podem ser deletados fisicamente do banco de dados.
  - Toda operacao de insercao, atualizacao ou cancelamento deve alimentar a tabela `HISTORICO_AUDITORIA`.

## 2. Prevencao contra SQL Injection (OWASP A03:2021)
- **Bind Variables Obrigatorias:** 100% das consultas executadas via `oracledb` ou qualquer driver DEVEM utilizar variaveis de ligacao (`:param`).
- **Proibicao de Interpolar Strings:** E estritamente proibido concatenar strings ou usar f-strings/formatacao dinamica para construir clausulas SQL (`SELECT ... WHERE id = " + id`).

## 3. Prevencao contra Cross-Site Scripting (XSS - OWASP A03:2021)
- **Sanitizacao na Borda da API:** Todo campo de texto livre clinico (`observacoes`, `anamnese`, `descricao_clinica`) deve ser sanitizado com a biblioteca `bleach` antes de ser persistido no banco de dados.
- **Escape no Client-Side:** O frontend React/Next.js deve renderizar dados utilizando binding padrao de JSX, nunca utilizando `dangerouslySetInnerHTML` com conteudo vindo do usuario.

## 4. Seguranca Criptografica e Credenciais (OWASP A02:2021)
- **Algoritmo de Hash:** Senhas de usuarios devem ser processadas utilizando **Argon2id** (algoritmo vencedor do Password Hashing Competition) ou Bcrypt de alta complexidade.
- **Gerenciamento de Segredos:** Nenhuma chave privada, secret JWT ou senha de banco de dados deve existir em arquivos rastreados pelo controle de versao. Todas devem ser injetadas exclusivamente via `.env`.

## 5. Rate Limiting e Protecao contra Forca Bruta (OWASP A07:2021)
- Endpoints de autenticacao (`POST /api/v1/auth/login`) devem aplicar limite rigoroso de requisicoes (maximo de 5 tentativas por minuto por IP) com resposta padronizada HTTP `429 Too Many Requests`.

## 6. Cabecalhos de Seguranca HTTP (Defense-in-Depth)
- O frontend Next.js deve servir cabecalhos de blindagem contra ataques de navegadores:
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY` (Mitigacao de Clickjacking)
  - `X-Content-Type-Options: nosniff` (Mitigacao de MIME Sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
