#Criação das Tabelas
from sqlite3 import Error
from hashlib import sha256
def create_table(conn):
    try:
        sql_create_users_table = """ CREATE TABLE IF NOT EXISTS usuarios (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        nome TEXT NOT NULL,
                                        cpf TEXT NOT NULL UNIQUE,
                                        data_nascimento TEXT NOT NULL,
                                        login TEXT NOT NULL UNIQUE,
                                        senha TEXT NOT NULL,
                                        saldo REAL DEFAULT 0.0,
                                        chave_pix TEXT UNIQUE,
                                        tel INTEGER[11]
                                    ); """
        conn.execute(sql_create_users_table)
    except Error as e:
        print(e)


# Funções auxiliares do banco
def hash_password(password):
    return sha256(password.encode()).hexdigest()

def get_user_by_login(conn, login):
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE login=?", (login,))
    return cur.fetchone()

def create_user(conn, nome, cpf, data_nascimento, login, senha, tel):
    senha_hashed = hash_password(senha)
    sql = ''' INSERT INTO usuarios(nome, cpf, data_nascimento, login, senha, tel)
              VALUES(?,?,?,?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, (nome, cpf, data_nascimento, login, senha_hashed, tel))
    conn.commit()
    return cur.lastrowid

def login_user(conn, login, senha):
    user = get_user_by_login(conn, login)
    if user and user[5] == hash_password(senha):
        return user
    return None

def update_saldo(conn, user_id, valor):
    sql = ''' UPDATE usuarios
              SET saldo = saldo + ?
              WHERE id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (valor, user_id))
    conn.commit()

def get_saldo(conn, user_id):
    cur = conn.cursor()
    cur.execute("SELECT saldo FROM usuarios WHERE id=?", (user_id,))
    return cur.fetchone()[0]

def set_chave_pix(conn, user_id, chave_pix):
    sql = ''' UPDATE usuarios
              SET chave_pix = ?
              WHERE id = ? '''
    cur = conn.cursor()
    cur.execute(sql, (chave_pix, user_id))
    conn.commit()

def get_user_by_id(conn, user_id):
    cur = conn.cursor()
    cur.execute("SELECT * FROM usuarios WHERE id=?", (user_id,))
    return cur.fetchone()
