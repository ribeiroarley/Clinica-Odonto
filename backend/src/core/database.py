import logging
from typing import Generator, Optional
import oracledb
from src.core.config import settings

logger = logging.getLogger("clinica_odonto.database")

# Pool singleton para reutilizacao de conexoes em modo Thin
_pool: Optional[oracledb.ConnectionPool] = None


def init_db_pool() -> None:
    """
    Inicializa o connection pool com o banco Oracle 23ai Free em modo Thin.
    Modo Thin dispensa a instalacao do Oracle Instant Client no sistema operacional.
    """
    global _pool
    if _pool is not None:
        return

    try:
        _pool = oracledb.create_pool(
            user=settings.APP_DB_USER,
            password=settings.APP_DB_PASSWORD,
            host=settings.ORACLE_HOST,
            port=settings.ORACLE_PORT,
            service_name=settings.APP_DB_SERVICE,
            min=settings.ORACLE_POOL_MIN,
            max=settings.ORACLE_POOL_MAX,
            increment=settings.ORACLE_POOL_INCREMENT,
        )
        logger.info(
            f"Pool Oracle iniciado com sucesso [{settings.APP_DB_USER}@{settings.ORACLE_HOST}:{settings.ORACLE_PORT}/{settings.APP_DB_SERVICE}]"
        )
    except Exception as exc:
        logger.warning(
            f"Nao foi possivel conectar ao Oracle durante o startup: {exc}. "
            "A API iniciara em modo standalone ate o banco responder."
        )
        _pool = None


def close_db_pool() -> None:
    """
    Finaliza e encerra ordenadamente todas as conexoes do pool.
    """
    global _pool
    if _pool is not None:
        try:
            _pool.close()
            logger.info("Pool de conexoes Oracle finalizado com sucesso.")
        except Exception as exc:
            logger.error(f"Erro ao fechar pool Oracle: {exc}")
        finally:
            _pool = None


def get_db_connection() -> Generator[oracledb.Connection, None, None]:
    """
    Injecao de dependencia para endpoints FastAPI.
    Garante controle transacional seguro com commit automatico em sucesso
    e rollback imediato em caso de excecao.
    """
    global _pool
    if _pool is None:
        raise RuntimeError(
            "Conexao com o banco de dados indisponivel. Verifique se o container Oracle 23ai esta ativo."
        )

    connection: oracledb.Connection = _pool.acquire()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        _pool.release(connection)


def get_db_connection_optional() -> Generator[Optional[oracledb.Connection], None, None]:
    """
    Injecao de conexao opcional para rotas com fallback resiliente.
    Retorna None caso o pool nao esteja ativo ou o container esteja iniciando.
    """
    global _pool
    if _pool is None:
        yield None
        return

    try:
        connection: oracledb.Connection = _pool.acquire()
    except Exception:
        yield None
        return

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        try:
            _pool.release(connection)
        except Exception:
            pass
