import requests
import time
from threading import Thread
from fastapi import HTTPException

class CoreService:
    def __init__(self, login_url, instituicao_id, instituicao_secret):
        self.login_url = login_url
        self.instituicao_id = instituicao_id
        self.instituicao_secret = instituicao_secret
        self.token = None
        self.expiration_time = None

    def login(self):
        response = requests.post(f"{self.login_url}/auth/", json={"instituicao_id": self.instituicao_id, "instituicao_secret": self.instituicao_secret})
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.expiration_time = time.time() + response.json().get("validateTime")
            print("Login bem-sucedido, token adquirido.")
        else:
            raise Exception("Falha ao fazer login na API do Banco Central")

    def revalidate_token(self):
        while True:
            time_to_sleep = self.expiration_time - time.time()
            if time_to_sleep > 0:
                time.sleep(time_to_sleep)
            self.login()  # Revalida o token
            print("Token revalidado com sucesso.")

    def get_token(self):
        if not self.token or time.time() > self.expiration_time:
            self.login()
        return self.token

    def create_pix_key(self, chave_pix, tipo_chave, user_id):
        try:
            response = requests.post(
                f"{self.login_url}/chave_pix/",
                json={"chave_pix": chave_pix, "tipo_chave": tipo_chave, "usuario_id": user_id, "instituicao_id": self.instituicao_id},
                headers={"Authorization": f"Bearer {self.get_token()}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Erro ao criar a chave PIX no core")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def delete_pix_key(self, chave_pix):
        try:
            response = requests.delete(
                f"{self.login_url}/chave_pix/{chave_pix}",
                headers={"Authorization": f"Bearer {self.get_token()}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Erro ao deletar a chave PIX no core")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def request_transacao_core(self, user_id_core, chave_pix, valor):
        try:
            response = requests.post(
                f"{self.login_url}/transacao",
                json={"usuario_id": user_id_core, "instituicao_id": self.instituicao_id, "chave_pix": chave_pix, "valor": valor},
                headers={"Authorization": f"Bearer {self.get_token()}"}
            )
            print(response.json())
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail = "Erro ao efetuar transacao no core")
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Função para fornecer o CoreService como dependência
def get_core_service():
    # Criação da instância do CoreService
    core_service = CoreService(
        login_url="https://projetosdufv.live",  # Substitua pelo URL correto
        instituicao_id="4786a354-b336-4c47-a47a-b2e1ea10fc29",
        instituicao_secret="$2b$12$Cea4mD6FUagDXiiJfqmNw.rupw8CrE0av832niu/xkGtfDly/tRHu"
    )

    # Loga ao serviço e começa a revalidação do token em uma thread separada
    core_service.login()
    Thread(target=core_service.revalidate_token, daemon=True).start()

    try:
        yield core_service
    finally:
        # Aqui, você poderia adicionar alguma lógica para liberar recursos, se necessário
        pass
