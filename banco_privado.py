from flask import Flask
from bancoA import BancoA
import conexao
import functionsBD
import requisicoes

app = Flask(__name__)
app.secret_key = 'your_secret_key'

database = "banco_privado.db"
conn = conexao.create_connection(database)
functionsBD.create_table(conn)

# Interface do Banco
banco_a = BancoA(conn)

# Rotas importadas do arquivo rotes.py
from rotes import register_routes

register_routes(app, banco_a)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
