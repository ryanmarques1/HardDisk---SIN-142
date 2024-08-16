#Classe do Banco Privado
import threading
import functionsBD
import sqlite3

class BancoA:
    def __init__(self, conn):
        self.conn = conn
        self.lock = threading.Lock()
    def cadastrar_usuario(self, nome, cpf, data_nascimento, login, senha, tel):
        try:
            user_id = functionsBD.create_user(self.conn, nome, cpf, data_nascimento, login, senha, tel)
            return {"status": "success", "message": "Usuário cadastrado com sucesso!", "user_id": user_id}
        except sqlite3.IntegrityError:
            return {"status": "error", "message": "Erro: CPF existente ou inválido  ou login já existente."}

    def login_usuario(self, login, senha):
        user = functionsBD.login_user(self.conn, login, senha)
        if user:
            return {"status": "success", "message": "Login bem-sucedido!", "user": user}
        else:
            return {"status": "error", "message": "Login ou senha incorretos."}

    def depositar(self, user_id, valor):
        with self.lock:
            functionsBD.update_saldo(self.conn, user_id, valor)
            saldo_atual = functionsBD.get_saldo(self.conn, user_id)
            return {"status": "success", "message": "Depósito realizado com sucesso!", "saldo": saldo_atual}

    def retirar(self, user_id, valor):
        with self.lock:
            saldo_atual = functionsBD.get_saldo(self.conn, user_id)
            if saldo_atual >= valor:
                functionsBD.update_saldo(self.conn, user_id, -valor)
                saldo_atualizado = functionsBD.get_saldo(self.conn, user_id)
                return {"status": "success", "message": "Retirada realizada com sucesso!", "saldo": saldo_atualizado}
            else:
                return {"status": "error", "message": "Saldo insuficiente."}

    def definir_chave_pix(self, user_id, chave_pix=None):
        if chave_pix is None:
            user = self.get_user_by_id(user_id)
            chave_pix = user[2]  # CPF como chave PIX
        functionsBD.set_chave_pix(self.conn, user_id, chave_pix)
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

            response = functionsBD.requests.post('http://localhost:5001/transferir', json=payload)
            if response.status_code == 200:
                data = response.json()
                if data['status'] == 'success':
                    functionsBD.update_saldo(self.conn, user_id, -valor)
                    return {"status": "success", "message": "Transferência realizada com sucesso!"}
                else:
                    return {"status": "error", "message": data['message']}
            else:
                return {"status": "error", "message": "Erro ao processar a transferência."}