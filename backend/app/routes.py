from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from validate_docbr import CPF
from app.models.UserModel import CadastroData, LoginData, ValorData, ChavePixData, DeleteChavePixData, SaldoData, PixKeyRequest, TransferenciaData
from app.services.auth import authenticate_user, create_access_token, get_current_user
from app.database.Conection import get_db
import app.services.userService as user_services
from jose import JWTError, jwt
from datetime import timedelta
#import requisicoes

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Rotas protegidas por JWT
@router.get("/")
async def index():
    return {"message": "API is up and running"}

@router.post("/cadastro")
async def cadastro(data: CadastroData, db=Depends(get_db)):
    return user_services.cadastrar_usuario(data, db)

@router.post("/login")
async def login(data: LoginData, db=Depends(get_db)):
    return user_services.login_usuario(data, db)

@router.put("/update-saldo")
def update_saldo_endpoint(data: SaldoData , db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.update_saldo(db, data.user_id, data.valor)

@router.get("/get-saldo")
def get_saldo_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_saldo(db, user_id)

@router.get("/operacoes")
def get_operacoes_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_operacoes(db, user_id)

@router.post("/chave_pix")
def create_chave_pix(request: PixKeyRequest, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.set_chave_pix(db, request.user_id, request.tipo_chave, request.chave_pix, request.user_id_core)

@router.delete("/chave_pix")
def delete_chave_pix(data: DeleteChavePixData, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.delete_chave_pix(db, data.chave_pix, data.user_id)

@router.get("/chave_pix")
def get_chave_pix_by_user_id_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_chave_pix_by_user_id(db, user_id)

@router.get("/get-user")
def get_user_by_id_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_user_by_id(db, user_id)

@router.put("/retirar-saldo")
def retirar_saldo_endpoint(user_id: int, valor: float, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.retirar_saldo(db, user_id, valor)

@router.post("/transacao")
def request_transacao(request: TransferenciaData, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.request_transacao(db, request.usuario_id, request.chave_pix, request.valor, request.user_id_core)