#!/bin/bash
set -e

echo "======================================================================"
echo " [Clinica-Odonto] Iniciando Provisionamento do Banco Oracle 23ai Free"
echo "======================================================================"

APP_DB_USER="${APP_DB_USER:-OWNER_ODONTO}"
APP_DB_PASSWORD="${APP_DB_PASSWORD:-OdontoApp#2026}"
APP_DB_SERVICE="${APP_DB_SERVICE:-FREEPDB1}"

echo "[Step 1/3] Configurando Roles e Usuario no PDB: ${APP_DB_SERVICE}..."

sqlplus -s / as sysdba <<EOF
WHENEVER SQLERROR EXIT SQL.SQLCODE;
ALTER SESSION SET CONTAINER = ${APP_DB_SERVICE};

-- 1. Criacao de Roles de Seguranca
BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE RL_ODONTO_APP';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1921 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE ROLE RL_ODONTO_READONLY';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1921 THEN RAISE; END IF;
END;
/

-- 2. Criacao do Usuario do Schema OWNER_ODONTO
DECLARE
    v_user_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM all_users WHERE username = UPPER('${APP_DB_USER}');
    IF v_user_count = 0 THEN
        EXECUTE IMMEDIATE 'CREATE USER ${APP_DB_USER} IDENTIFIED BY "${APP_DB_PASSWORD}" DEFAULT TABLESPACE USERS TEMPORARY TABLESPACE TEMP QUOTA UNLIMITED ON USERS';
    ELSE
        EXECUTE IMMEDIATE 'ALTER USER ${APP_DB_USER} IDENTIFIED BY "${APP_DB_PASSWORD}" DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS ACCOUNT UNLOCK';
    END IF;
END;
/

-- 3. Concessao de Privilegios Estruturais
GRANT CREATE SESSION,
      CREATE TABLE,
      CREATE VIEW,
      CREATE PROCEDURE,
      CREATE SEQUENCE,
      CREATE TRIGGER,
      CREATE SYNONYM,
      CREATE ANY SYNONYM
TO ${APP_DB_USER};

EXIT;
EOF

echo "[Step 2/3] Conectando como ${APP_DB_USER} e executando Master Deploy..."

SQL_DIR="/opt/oracle/app-database/oracle"

if [ -d "$SQL_DIR" ]; then
    cd "$SQL_DIR"
    sqlplus -s "${APP_DB_USER}/${APP_DB_PASSWORD}@localhost:1521/${APP_DB_SERVICE}" <<EOF
    WHENEVER SQLERROR EXIT SQL.SQLCODE;
    @ORACLE__main_deploy_odonto.sql
    EXIT;
EOF
    echo "[Step 3/3] Master Deploy finalizado com sucesso!"
else
    echo "ERRO CRITICO: Diretorio de scripts ${SQL_DIR} nao foi encontrado!"
    exit 1
fi

echo "======================================================================"
echo " [Clinica-Odonto] Provisionamento Concluido com Exito!"
echo "======================================================================"
