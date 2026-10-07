# 🦷 OdontoSys Pro — Sistema Clínico & Odontológico Fullstack

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Oracle Database](https://img.shields.io/badge/Database-Oracle%2023ai%20Free-F80000?style=flat&logo=oracle)](https://www.oracle.com/database/free/)
[![Security](https://img.shields.io/badge/Security-Argon2id%20%7C%20RBAC%20%7C%20LGPD-10b981?style=flat&logo=shield)](https://owasp.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

Sistema corporativo fullstack para **Clínicas Odontológicas**, concebido com arquitetura orientada a camadas limpas, estrita conformidade com a **LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)**, segurança em profundidade (**Defense in Depth**) e odontograma anatômico vetorial no padrão internacional **FDI (Fédération Dentaire Internationale)**.

---

## 🏛️ 1. Arquitetura do Monorepo

O repositório é organizado em camadas desacopladas e fortemente tipadas:

```text
Clinica-Odonto/
├── .agent/skills/                   # Skills de IA e governança técnica
│   ├── clinical-appsec-guard/      # Regras de cibersegurança e LGPD
│   └── frontend-clinical-design/   # Design médico, acessibilidade e ergonomia
├── database/                        # Camada de Persistência e RDBMS
│   ├── init-scripts/               # Provisionamento automatizado do contêiner
│   └── oracle/                     # Objetos estruturados isolados por dialeto
│       ├── tables/                 # DDLs relacionais (incluindo TB_ODONTOGRAMA e TB_USUARIOS)
│       ├── packages/               # Regras de negócio e transações em PL/SQL
│       ├── procedures/             # Procedimentos armazenados
│       ├── functions/              # Validações estruturais (ex.: Validação de CPF)
│       ├── triggers/               # Auditoria JSON e bloqueio físico de deleção
│       ├── views/                  # Visões de agenda diária e procedimentos
│       ├── indexes/                # Índices idempotentes defensivos
│       ├── sequences/              # Geradores de identificadores
│       └── seeds/                  # Carga inicial com senhas hasheadas em Argon2id
├── backend/                         # Camada de Serviços & APIs (FastAPI)
│   ├── .venv/                      # Ambiente virtual isolado (ignorado pelo Git)
│   ├── scripts/                    # Scripts utilitários de seed e migração
│   └── src/
│       ├── core/                   # Configurações Pydantic V2 e pool Thin oracledb
│       ├── modules/
│       │   ├── auth/               # Autenticação JWT, Argon2id e RBAC
│       │   ├── odontograma/        # Endpoints médicos de prontuário e FDI
│       │   ├── agendamentos/       # Regras de janela e prevenção de conflitos
│       │   └── pacientes/          # Cadastro de pacientes e validações
│       └── shared/                 # Sanitização XSS (bleach) e validadores
├── frontend/                        # Camada de Interface & UX Médica (Next.js 14)
│   ├── src/
│   │   ├── app/                    # App Router moderno
│   │   │   ├── (auth)/login/       # Tela de login segura contra força bruta
│   │   │   └── (dashboard)/        # Layout corporativo protegido por RBAC
│   │   │       ├── page.tsx        # Dashboard Executivo e Clínico Geral
│   │   │       ├── agenda/         # Central de agendamentos e recepção
│   │   │       ├── pacientes/      # Prontuários e fichas clínicas
│   │   │       ├── odontograma/    # Odontograma Anatômico Interativo FDI
│   │   │       └── financeiro/     # Demonstrativo de honorários e cobranças
│   │   ├── components/clinical/    # Componentes SVG vetoriais de dentes e faces
│   │   ├── lib/                    # Cliente HTTP tipado e contexto de autenticação
│   │   └── middleware.ts           # Edge Middleware para proteção de rotas e LGPD
├── docs/                            # Dicionário de dados e fluxos clínicos
├── dev.ps1                          # Orquestrador mestre local (Windows / PowerShell)
├── docker-compose.yml               # Oracle Database 23ai Free isolado
├── GEMINI.md                        # Diretrizes e governança primária do projeto
└── .env.example                     # Modelo documentado de variáveis sensíveis
```

---

## 🛡️ 2. Cibersegurança & LGPD (Defense in Depth)

A aplicação segue preceitos avançados do **OWASP Top 10** e salvaguardas da **LGPD para dados médicos sensíveis** (Art. 5º, II):

| Camada | Mecanismo de Defesa | Impacto / Proteção |
| :--- | :--- | :--- |
| **Autenticação** | **Argon2id** (`$argon2id$v=19$m=65536,t=3,p=4`) | Algoritmo vencedor da Password Hashing Competition; resistente a ataques GPU/ASIC. |
| **Rate Limiting** | **SlowAPI** na borda do FastAPI | Limite estrito de 5 tentativas por minuto por IP no endpoint `/auth/login`. |
| **Imutabilidade** | Trigger PL/SQL `TRG_BLOQUEIA_DELETE_AUDITORIA` | Dispara exceção `ORA-20099` bloqueando qualquer `UPDATE` ou `DELETE` na tabela `HISTORICO_AUDITORIA`. |
| **SQL Injection** | **Bind Variables Obrigatórias** | 100% das consultas utilizam `:bind_name` do driver `python-oracledb`. |
| **Cross-Site Scripting** | Sanitização com **Bleach** | Textos clínicos livres (anamnese, observações e evolução) são higienizados na borda antes do banco. |
| **Edge Middleware** | Next.js Edge Middleware (`middleware.ts`) | Usuários não autenticados são barrados; usuários com papel `RECEPCAO` são impedidos de visualizar o odontograma clínico. |
| **Security Headers** | `next.config.js` | CSP restritivo, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`. |

---

## 🔑 3. Credenciais de Demonstração (Seed)

O banco é inicializado com as seguintes credenciais protegidas por hash **Argon2id**:

> **Senha Padrão para Todos os Perfis:** `Odonto@2026`

| Usuário (Email) | Nome Completo | Perfil (Role) | Registro (CRO) | Escopo de Permissões |
| :--- | :--- | :---: | :---: | :--- |
| `admin@clinica.com` | Dr. Roberto Carlos | `ADMIN` | — | Acesso irrestrito (Dashboard, Clínica, Financeiro, Configurações). |
| `dra.ana@clinica.com` | Dra. Ana Beatriz Silva | `DENTISTA` | `CRO-SP-12345` | Acesso clínico completo: Dashboard, Odontograma FDI, Prontuários e Agenda. |
| `recepcao@clinica.com` | Mariana Costa | `RECEPCAO` | — | Acesso à recepção: Agenda, Pacientes e Financeiro. **Bloqueio LGPD no Odontograma.** |

---

## 🚀 4. Guia de Execução Local

### Pré-requisitos
- **Windows 10/11** com PowerShell 7 ou Windows PowerShell 5.1.
- **Docker Desktop** ativo.
- **Node.js 18+** instalado.
- **Python 3.11+** com virtualenv.

### Orquestrador Unificado (`dev.ps1`)

O projeto inclui o script mestre [`dev.ps1`](./dev.ps1) na raiz para gerenciamento com um único comando:

```powershell
# 1. Iniciar toda a infraestrutura (Oracle 23ai + Backend + Frontend)
.\dev.ps1

# 2. Executar apenas o seed de usuários com Argon2id
.\dev.ps1 -Mode seed

# 3. Subir componentes isolados (opcional)
.\dev.ps1 -Mode db         # Apenas o Oracle Database 23ai Free
.\dev.ps1 -Mode backend    # Apenas o Backend FastAPI na porta 8000
.\dev.ps1 -Mode frontend   # Apenas o Frontend Next.js na porta 3000

# 4. Encerrar todos os serviços e liberar as portas
.\dev.ps1 -Mode stop
```

### Endpoints e URLs de Acesso

* **Aplicação Web (Next.js):** [http://localhost:3000](http://localhost:3000)
* **Documentação Interativa Swagger (FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check da API:** [http://localhost:8000/health](http://localhost:8000/health)
* **Oracle Database 23ai Free:** `localhost:1521/FREEPDB1` (Usuário: `OWNER_ODONTO`)

---

## 🦷 5. Odontograma Interativo (Padrão FDI)

A bancada clínica implementa o odontograma conforme a norma da **FDI (Fédération Dentaire Internationale)**:

* **Arcadas Suportadas:**
  * **Dentes Permanentes (Quadrantes 1 a 4):** 11 a 18, 21 a 28, 31 a 38, 41 a 48 (32 dentes).
  * **Dentes Decíduos (Quadrantes 5 a 8):** 51 a 55, 61 a 65, 71 a 75, 81 a 85 (20 dentes).
* **Mapeamento Anatômico das 5 Faces (SVG):**
  * **V** — Vestibular
  * **L** — Lingual / Palatina
  * **M** — Mesial
  * **D** — Distal
  * **O** — Oclusal / Incisal
* **Status por Face e Geral:**
  * Higidez (`HIGIDO`), Cárie (`CARIE` - Vermelho Clínico), Restauração (`RESTAURADO` - Azul Clínico), Canal/Endodontia (`CANAL` - Violeta), Ausente/Exodontia (`AUSENTE` - Cinza Riscado), Implante (`IMPLANTE` - Dourado) e Em Tratamento (`EM_TRATAMENTO` - Âmbar).

---

## 📋 6. Governança e Regras do Repositório

* **Sem Commits Automáticos:** O agente automatizado nunca executa `git commit` ou `git push` sem aprovação direta do usuário no chat (conforme [`GEMINI.md`](./GEMINI.md)).
* **Strict Typing:** TypeScript configurado com `strict: true` (proibição de `any`) e Python 100% tipado com Pydantic V2.
* **Segredos:** Credenciais e chaves JWT residem exclusivamente em `.env` (ignorado pelo `.gitignore`), sendo disponibilizado apenas o [.env.example](./.env.example) versionado.

---

*Desenvolvido para excelência clínica, conformidade médica e segurança corporativa.*
