from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from datetime import datetime
from validate_docbr import CPF


import bancoA
import conexao
import functionsBD  
import requisicoes


app = Flask(__name__)
app.secret_key = 'your_secret_key'


database = "banco_privado.db"
conn = conexao.create_connection(database)
functionsBD.create_table(conn)

# Interface do Banco
banco_a = bancoA(conn)
# Interface do Banco



#Rotas com o core
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
    saldo = bancoA.get_saldo(conn, user_id)
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

@app.route('/loginI', methods=['POST'])
def loginIi():
    response = requisicoes.printa_token()
    return response

if __name__ == '__main__':
    #requisicoes.puxa_token()
    #print(f'Token Global: {global_token}')
    app.run(debug=True, port=5000)
