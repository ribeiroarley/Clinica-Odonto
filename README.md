# Clínica Odontológica - Database Architecture

Projeto de banco de dados relacional para gestão de **Cadastro e Atendimento de uma Clínica Odontológica**, desenvolvido com base em práticas ágeis e cultura DevOps.

## Estrutura de Pastas e Nomenclatura
O projeto adota rigorosamente a nomenclatura `ORACLE__` para todos os scripts SQL. Isso permite fácil identificação dos artefatos em pipelines de CI/CD (Liquibase, Flyway ou shell scripts customizados).
O banco de dados inteiro fica isolado dentro do schema `OWNER_ODONTO`.

### Diretórios Principais
- `DOCUMENTACAO/`: Modelagem lógica e dicionário de dados.
- `TABLES/`, `SEQUENCE/`, `INDEX/`: Scripts DDL estruturais.
- `PACKAGE/`, `PACKAGE_BODY/`, `PROCEDURE/`, `FUNCTION/`, `TRIGGER/`: Lógica de negócio PL/SQL e automações.
- `VIEW/`, `SYNONYMS/`: Visualização e abstração.
- `GRANTS/`: Scripts de segurança.
- `INSERT/`, `UPDATE/`: Scripts de carga de dados.

## Instruções de Uso

### Pré-requisitos
- Um banco de dados Oracle ativo.
- O schema (usuário) `OWNER_ODONTO` já deve estar criado previamente pelo DBA com grants de `CREATE TABLE`, `CREATE SEQUENCE`, `CREATE PROCEDURE`, `CREATE VIEW`, `CREATE TRIGGER`, `CREATE SYNONYM`.
- As Roles `RL_ODONTO_APP` e `RL_ODONTO_READONLY` devem existir no banco de dados, caso contrário os grants irão falhar.

### Executando o Deploy
Abra o SQLcl ou SQL*Plus na raiz do projeto (onde está localizado este README) e conecte-se com um usuário com privilégios DBA ou diretamente com `OWNER_ODONTO`:

```sql
sqlplus OWNER_ODONTO/sua_senha@seu_banco

-- Executa o script mestre consolidado
SQL> @ORACLE__main_deploy_odonto.sql
```

## Controle de Acesso (Roles)
- **RL_ODONTO_APP:** Acesso voltado à aplicação backend. Possui privilégios para executar Procedures, Packages, e realizar DML nas tabelas transacionais (Pacientes, Agendamentos, Prontuário).
- **RL_ODONTO_READONLY:** Acesso de relatórios e painéis da recepção. Possui permissão apenas de `SELECT` nas views e tabelas.

## Boas Práticas Adotadas
- Todos os arquivos definem claramente o owner do objeto (`OWNER_ODONTO.NOME_DO_OBJETO`).
- Ausência de blocos anônimos soltos para operações de infraestrutura.
- Uso de `SYSDATE` gerenciado por trigger ou por default em constraints.
- Isolamento de regras complexas na camada de **Packages**.
- Tabela dedicada de log (`HISTORICO_AUDITORIA`) preenchida de forma transparente usando JSON.
