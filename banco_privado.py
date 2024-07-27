from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import sqlite3
from sqlite3 import Error
from hashlib import sha256
from datetime import datetime
import threading
import requests
from validate_docbr import CPF #Verificar 

app = Flask(__name__)
app.secret_key = 'your_secret_key'


# Criação do banco de dados e tabelas
def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file, check_same_thread=False)
        return conn
    except Error as e:
        print(e)
    return conn

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

database = "banco_privado.db"
conn = create_connection(database)
create_table(conn)

# Funções auxiliares
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

# Interface do Banco
class BancoA:
    cpf_v = CPF()
    def __init__(self, conn):
        self.conn = conn
        self.lock = threading.Lock()

    def cadastrar_usuario(self, nome, cpf, data_nascimento, login, senha, tel):
        try:
            user_id = create_user(self.conn, nome, cpf, data_nascimento, login, senha, tel)
            return {"status": "success", "message": "Usuário cadastrado com sucesso!", "user_id": user_id}
        except sqlite3.IntegrityError:
            return {"status": "error", "message": "Erro: CPF existente ou inválido  ou login já existente."}

    def login_usuario(self, login, senha):
        user = login_user(self.conn, login, senha)
        if user:
            return {"status": "success", "message": "Login bem-sucedido!", "user": user}
        else:
            return {"status": "error", "message": "Login ou senha incorretos."}

    def depositar(self, user_id, valor):
        with self.lock:
            update_saldo(self.conn, user_id, valor)
            saldo_atual = get_saldo(self.conn, user_id)
            return {"status": "success", "message": "Depósito realizado com sucesso!", "saldo": saldo_atual}

    def retirar(self, user_id, valor):
        with self.lock:
            saldo_atual = get_saldo(self.conn, user_id)
            if saldo_atual >= valor:
                update_saldo(self.conn, user_id, -valor)
                saldo_atualizado = get_saldo(self.conn, user_id)
                return {"status": "success", "message": "Retirada realizada com sucesso!", "saldo": saldo_atualizado}
            else:
                return {"status": "error", "message": "Saldo insuficiente."}

    def definir_chave_pix(self, user_id, chave_pix=None):
        if chave_pix is None:
            user = self.get_user_by_id(user_id)
            chave_pix = user[2]  # CPF como chave PIX
        set_chave_pix(self.conn, user_id, chave_pix)
        return {"status": "success", "message": "Chave PIX definida com sucesso!", "chave_pix": chave_pix}

    def get_user_by_id(self, user_id):
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM usuarios WHERE id=?", (user_id,))
        return cur.fetchone()

    def transferir(self, user_id, chave_pix_destino, valor):
        with self.lock:
            user = self.get_user_by_id(user_id)
            if user[6] < valor:
                return {"status": "error", "message": "Saldo insuficiente."}

            payload = {
                "chave_pix_origem": user[7],
                "chave_pix_destino": chave_pix_destino,
                "valor": valor
            }

            response = requests.post('http://localhost:5001/transferir', json=payload)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    update_saldo(self.conn, user_id, -valor)
                    return {"status": "success", "message": "Transferência realizada com sucesso!"}
                else:
                    return {"status": "error", "message": data['message']}
            else:
                return {"status": "error", "message": "Erro ao processar a transferência."}

banco_a = BancoA(conn)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    cpf_v = CPF()
    if request.method == 'POST':
        data = request.form
        response = banco_a.cadastrar_usuario(data['nome'], data['cpf'], data['data_nascimento'], data['login'], data['senha'], data['tel'])
        if cpf_v.validate(data['cpf']): #Validando CPF
            if response['status'] == 'success':
                return redirect(url_for('login'))
        else:
            return render_template('cadastro.html', error=response['message'])
    return render_template('cadastro.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.form
        response = banco_a.login_usuario(data['login'], data['senha'])
        if response['status'] == 'success':
            session['user_id'] = response['user'][0]
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error=response['message'])
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    user = banco_a.get_user_by_id(user_id)
    saldo = get_saldo(conn, user_id)
    return render_template('dashboard.html', user=user, saldo=saldo)

@app.route('/depositar', methods=['POST'])
def depositar():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    valor = float(request.form['valor'])
    response = banco_a.depositar(user_id, valor)
    return redirect(url_for('dashboard'))

@app.route('/retirar', methods=['POST'])
def retirar():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    valor = float(request.form['valor'])
    response = banco_a.retirar(user_id, valor)
    return redirect(url_for('dashboard'))

@app.route('/definir_chave_pix', methods=['POST'])
def definir_chave_pix():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    chave_pix = request.form.get('chave_pix')
    response = banco_a.definir_chave_pix(user_id, chave_pix)
    return redirect(url_for('dashboard'))

@app.route('/transferir', methods=['POST'])
def transferir():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user_id = session['user_id']
    chave_pix_destino = request.form['chave_pix_destino']
    valor = float(request.form['valor'])
    response = banco_a.transferir(user_id, chave_pix_destino, valor)
    return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
