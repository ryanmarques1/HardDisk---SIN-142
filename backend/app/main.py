from fastapi import FastAPI
from app.routes import router
from app.services.coreServices import CoreService
from threading import Thread
from app.database.CreateDatabase import create_database, create_tables
app = FastAPI()

app.include_router(router)

# Configurações da API do Banco Central
central_bank_login_url = "https://projetosdufv.live/auth"
instituicao_id = "4786a354-b336-4c47-a47a-b2e1ea10fc29"
instituicao_secret = "$2b$12$Cea4mD6FUagDXiiJfqmNw.rupw8CrE0av832niu/xkGtfDly/tRHu"

# Inicializar o serviço de token
token_service = CoreService(central_bank_login_url, instituicao_id, instituicao_secret)


@app.on_event("startup")
def startup_event():
    create_database()
    create_tables() 
    # Fazer login no banco central ao iniciar a aplicação
    token_service.login()

    # Iniciar a thread para revalidação automática do token
    Thread(target=token_service.revalidate_token, daemon=True).start()
