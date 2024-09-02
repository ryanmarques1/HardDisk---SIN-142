import psycopg2
from psycopg2 import sql

# Configurações do banco de dados
DB_NAME = "CalvoBank_Database"
DB_USER = "user"
DB_PASSWORD = "password"
DB_HOST = "localhost"  # Ajuste conforme necessário
DB_PORT = "5432"  # Ajuste conforme necessário

# Função para criar o banco de dados se não existir
def create_database():
    # Conectar ao banco de dados padrão postgres para verificar/criar o novo banco de dados
    try:
        conn = psycopg2.connect(
            dbname="postgres",  # Usamos o banco de dados padrão "postgres"
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True  # Precisamos de autocommit para criar o banco de dados

        cur = conn.cursor()

        # Verifica se o banco de dados já existe
        cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}';")
        exists = cur.fetchone()

        # Se o banco não existir, cria-o
        if not exists:
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
            print(f"Banco de dados {DB_NAME} criado com sucesso.")
        else:
            print(f"Banco de dados {DB_NAME} já existe.")

        # Fechando a conexão com o banco de dados "postgres"
        cur.close()
        conn.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro ao verificar/criar banco de dados: {error}")

# Função para criar as tabelas no banco de dados
def create_tables():
    commands = (
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            cpf VARCHAR(11) NOT NULL UNIQUE,
            data_nascimento DATE NOT NULL,
            email VARCHAR(255) UNIQUE,
            login VARCHAR(50) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            tel VARCHAR(20),
            saldo NUMERIC DEFAULT 0,
            chave_pix VARCHAR(255)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS transferencias (
            id SERIAL PRIMARY KEY,
            user_id_origem INTEGER NOT NULL REFERENCES usuarios(id),
            user_id_destino INTEGER NOT NULL REFERENCES usuarios(id),
            valor NUMERIC NOT NULL,
            data_transferencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS operacoes (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(255) NOT NULL,
            user_id INTEGER NOT NULL REFERENCES usuarios(id),
            valor NUMERIC NOT NULL,
            data_operacoes TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS chave_pix (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES usuarios(id),
            tipo_chave VARCHAR(255) NOT NULL,
            chave_pix VARCHAR(255) NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    try:
        # Conectar ao banco de dados recém-criado ou existente
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )

        cur = conn.cursor()
        
        # Criando as tabelas
        for command in commands:
            cur.execute(command)
        
        # Commitando as mudanças
        conn.commit()

        # Fechando a conexão
        cur.close()
        conn.close()

        print("Tabelas criadas com sucesso.")

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Erro ao criar tabelas: {error}")
    finally:
        if conn is not None:
            conn.close()
