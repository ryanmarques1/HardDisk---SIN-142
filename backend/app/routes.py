from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from validate_docbr import CPF
from app.services.initituicaoService import BancoA
from app.models.UserModel import CadastroData, LoginData, ValorData, ChavePixData, TransferenciaData, SaldoData
import app.services.userService as user_services
from app.database.Conection import get_db
from jose import JWTError, jwt
from datetime import timedelta
from app.services.auth import authenticate_user, create_access_token, get_current_user
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
def set_chave_pix_endpoint(data: ChavePixData, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.set_chave_pix(db, data.user_id, data.chave_pix, data.tipo_chave)

@router.get("/chave_pix")
def get_chave_pix_by_user_id_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_chave_pix_by_user_id(db, user_id)

@router.get("/get-user")
def get_user_by_id_endpoint(user_id: int, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.get_user_by_id(db, user_id)

@router.put("/retirar-saldo")
def retirar_saldo_endpoint(user_id: int, valor: float, db=Depends(get_db), current_user=Depends(get_current_user)):
    return user_services.retirar_saldo(db, user_id, valor)