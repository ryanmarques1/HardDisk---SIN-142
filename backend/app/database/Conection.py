from psycopg2.extras import RealDictCursor
import psycopg2

# Conexão com o PostgreSQL
def get_db():
    conn = psycopg2.connect(
        dbname="CalvoBank_Database",
        user="user",
        password="password",
        host="localhost",
        port="5432"
    )
    try:
        yield conn
    finally:
        conn.close()