---
name: clinical-ai-governance
description: Diretrizes de governança de inteligência artificial, conformidade com o EU AI Act (Alto Risco), LGPD (Art. 11/20), NIST AI RMF, ISO/IEC 42001 e salvaguardas Human-in-the-Loop para o sistema clínico.
---

# Governança de Inteligência Artificial Clínica (Clinical AI Governance)

Esta skill estabelece os requisitos mandatórios de governança ética, conformidade jurídica e segurança operacional para todos os módulos e agentes de IA operando no ecossistema **Clinica-Odonto**.

---

## 1. Classificação Regulatória e Enquadramento Legal
- **EU AI Act (Anexo III - Sistemas de Alto Risco):** Os algoritmos de auxílio ao diagnóstico e codificação de prontuários em saúde odontológica são classificados como **Sistemas de Alto Risco**.
- **LGPD (Lei 13.709/2018 - Art. 11 e Art. 20):**
  - Dados odontológicos, patologias e relatos de anamnese constituem **Dados Pessoais Sensíveis de Saúde**.
  - **Art. 20 (Direito à Revisão de Decisões Automatizadas):** O titular dos dados e o profissional de saúde têm direito à explicação inteligível sobre os critérios e procedimentos utilizados para a recomendação algorítmica.

---

## 2. Salvaguarda Soberana Human-in-the-Loop (HITL)
- **Proibição de Decisão Autônoma:** Modelos de IA NUNCA gravam, alteram ou excluem procedimentos de prontuário de forma unilateral.
- **Validação Médica Obrigatória:** Toda sugestão gerada pela IA permanece em **estado transitório** (borda tracejada/cor âmbar no odontograma FDI) até que um cirurgião-dentista autenticado (`DENTISTA`) com CRO ativo exerça uma das três deliberações soberanas:
  1. **Aceitar:** O profissional homologa a recomendação, gravando-a definitivamente na ficha clínica (status `ACEITO` na auditoria).
  2. **Modificar:** O profissional ajusta elementos, faces ou procedimentos conforme seu julgamento clínico prévio (status `MODIFICADO` na auditoria).
  3. **Rejeitar:** O profissional recusa a recomendação, fornecendo justificativa clínica documentada (status `REJEITADO` na auditoria).
- **Controle RBAC Estrito:** Usuários com perfil `RECEPCAO` estão expressamente bloqueados de acionar o copiloto ou deliberar sobre sugestões clínicas.

---

## 3. Privacidade por Padrão e Zero PII (Privacy by Design)
- **Higienização de Dados (Sanitization):** Antes de qualquer inferência algorítmica (local ou externa), o payload clínico deve ser submetido à camada de anonimização estrita:
  - Eliminação de CPFs (máscara `[CPF_REMOVIDO]`).
  - Mascaramento de nomes próprios (`[PACIENTE_ANONIMIZADO]`).
  - Remoção de telefones, e-mails e identificadores de prontuário.
- **Assinatura Criptográfica:** O hash criptográfico SHA-256 do texto anonimizado (`HASH_ENTRADA_ANONIMIZADA`) deve ser armazenado na tabela de auditoria para fins de não-repúdio sem persistência desnecessária de dados em repouso.

---

## 4. Defesa contra Prompt Injection e Envenenamento de Contexto (OWASP LLM01)
- **Filtro de Injeção Direta e Indireta:** Relatos clínicos e notas livres devem ser inspecionados para detecção de vetores de evasão de instruções (`ignore previous instructions`, `system prompt`, `jailbreak`, `<script>`, manipulações de regras de negócio).
- **Tratamento de Exceção:** Payloads com suspeita de injeção são abortados imediatamente com erro HTTP 400 antes de atingir o motor de inferência.

---

## 5. Rastreabilidade, Auditoria Imutável e ISO/IEC 42001
- **Tabela Dedicada:** Toda inferência é registrada de forma append-only em `OWNER_ODONTO.TB_AUDITORIA_IA`.
- **Campos Mandatórios de Auditoria:**
  - `ID_AUDITORIA_IA` (Identificador sequencial)
  - `ID_PACIENTE` e `ID_DENTISTA`
  - `NOME_MODELO` e `VERSAO_MODELO`
  - `TIPO_CASO_USO` (ex: `COPILOTO_ODONTOGRAMA`)
  - `HASH_ENTRADA_ANONIMIZADA`
  - `PAYLOAD_SUGESTAO_JSON` (Sugestões geradas)
  - `STATUS_DECISAO_HUMANA` (`ACEITO`, `MODIFICADO`, `REJEITADO`, `PENDENTE`)
  - `JUSTIFICATIVA_REJEICAO` (Quando aplicável)
  - `SCORE_CONFIANCA` (Métrica estatística)
  - `TEMPO_RESPOSTA_MS`
- **Explicabilidade Algorítmica (Explainability):** Cada procedimento sugerido deve conter o campo `evidencia_texto` citando o trecho do relato do qual a inferência emergiu.

---

## 6. Monitoramento Contínuo e Mitigação de Deriva (Drift)
- **Métricas de Desempenho e Alinhamento:**
  - Taxa de Acurácia Clínica Percebida: Razão de sugestões aceitas vs modificadas/rejeitadas.
  - Latência de Inserção: Tempo de resposta alvo inferior a 1500ms.
- **Kill Switch Emergencial:** Em caso de anomalia de inferência, alucinação patológica recorrente ou indisponibilidade do modelo, o sistema desativa transparentemente as sugestões assistivas mantendo o fluxo manual de odontograma 100% operacional.
