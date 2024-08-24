from datetime import datetime, timedelta
from typing import Union

from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.database.Conection import get_db

# Chave secreta e algoritmo para criptografar o JWT
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto de criptografia para hashing de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearer define o endpoint de login que emite o token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Função para verificar se a senha digitada corresponde ao hash
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Função para hashear uma senha
def get_password_hash(password):
    return pwd_context.hash(password)

# Função para criar um JWT
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Modelo Pydantic para os dados contidos no token
class TokenData(BaseModel):
    username: Union[str, None] = None

# Função para obter o usuário a partir do banco de dados pelo nome de usuário
def get_user(db, username: str):
    # Simulação de recuperação de usuário do banco de dados
    with db.cursor() as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE login = %s;", (username,))
        return cursor.fetchone()

# Função para autenticar o usuário
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user["senha"]):
        return False
    return user

# Função para verificar o token e proteger as rotas
def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
