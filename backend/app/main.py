from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from app.services.coreServices import CoreService
from threading import Thread
from app.database.CreateDatabase import create_database, create_tables
app = FastAPI()

app.include_router(router)

# Configuração CORS
origins = [
    "http://localhost:3000",  # Adicione o domínio que você deseja permitir
    # Adicione outros domínios permitidos aqui
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permitir estas origens
    allow_credentials=True,  # Permitir o envio de cookies e credenciais
    allow_methods=["*"],  # Permitir todos os métodos HTTP
    allow_headers=["*"],  # Permitir todos os cabeçalhos
)

@app.on_event("startup")
def startup_event():
    create_database()
    create_tables() 
    # Fazer login no banco central ao iniciar a aplicação
