# Governança do Projeto: Clínica Odontológica Fullstack

Este documento é a diretriz primária para todos os agentes de IA operando no repositório.

## 1. Princípios Inegociáveis de Engenharia
- **Sem Commits Automáticos:** O agente NUNCA deve executar `git commit`, `git push`, `git reset --hard` ou operações destrutivas no controle de versão sem aprovação explícita do usuário no chat.
- **Spec First (Desenvolvimento Orientado a Especificação):** Antes de implementar qualquer funcionalidade, documente os schemas de entrada/saída, validações e casos de borda.
- **Isolamento de Camadas:**
  - `database/`: Scripts DDL, migrations e dados de teste/seed isolados por dialeto.
  - `backend/`: Regras de negócio puras, autenticação, controle transacional e APIs RESTful tipadas.
  - `frontend/`: Apresentação, ergonomia visual e consumo seguro da API. Nenhuma regra de negócio crítica reside exclusivamente no client-side.

## 2. Padrões de Código e Tipagem Estrita
- **TypeScript (Frontend & Backend se Node/Nest):** `strict: true` ativado no `tsconfig.json`. Proibido o uso de `any`. Use tipos literais, `unknown` com type guards ou schemas Zod.
- **Python (se Backend FastAPI):** Tipagem obrigatória com Type Annotations em 100% das funções, modelos estritos via Pydantic V2 e conformidade com PEP 8.
- **Validação de Documentos:** CPFs, datas e registros profissionais (CRO) devem ser validados na borda da API antes de atingir o banco.

## 3. Segurança e Compliance Clínico (LGPD / Prontuários)
- **Imutabilidade do Histórico:** Registros de prontuário já finalizados não devem sofrer `DELETE` físico. Quaisquer alterações devem gerar trilha auditada em `HISTORICO_AUDITORIA`.
- **Proteção de Dados Médicos:** Anamnese e dados clínicos sensíveis devem ser trafegados exclusivamente sobre HTTPS e com proteção RBAC estrita (apenas dentistas autenticados acessam conteúdo clínico de prontuário).
- **Sem Segredos no Código:** Credenciais de banco, chaves JWT e variáveis sensíveis devem residir estritamente em arquivos `.env` ignorados pelo `.gitignore`.

## 4. Testes e Validação Obrigatória
- Todo endpoint de agendamento e prontuário deve conter testes de integração que comprovem a prevenção de conflitos de horários (janela de 30 minutos).
- A interface de agendamento e odontograma deve conter validações automatizadas de fluxo via testes E2E (Playwright).
