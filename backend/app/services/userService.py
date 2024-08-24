from fastapi import FastAPI, HTTPException, Depends, status
from validate_docbr import CPF
from psycopg2.extras import RealDictCursor
from jose import jwt
from datetime import timedelta
from app.services.auth import create_access_token, verify_password, get_password_hash
from app.models.UserModel import CadastroData, LoginData, ValorData, ChavePixData, TransferenciaData
from hashlib import sha256
import psycopg2

ACCESS_TOKEN_EXPIRE_MINUTES = 1800

def cadastrar_usuario(data: CadastroData, db):
    cpf_v = CPF()
    
    # Verifica se o CPF é válido
    if not cpf_v.validate(data.cpf):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid CPF")
    
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        # Verifica se o login já existe no banco de dados
        cursor.execute("SELECT * FROM usuarios WHERE login = %s;", (data.login,))
        user = cursor.fetchone()
        if user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login already exists")

        # Hash da senha antes de armazenar no banco de dados
        hashed_password = get_password_hash(data.senha)
        
        # Insere o novo usuário no banco de dados
        cursor.execute(
            """
            INSERT INTO usuarios (nome, cpf, data_nascimento, login, senha, tel)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
            """,
            (data.nome, data.cpf, data.data_nascimento, data.login, hashed_password, data.tel)
        )
        
        user_id = cursor.fetchone()["id"]
        db.commit()
    
    # Gera o token JWT para o novo usuário
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": data.login},  # "sub" contém o login do usuário
        expires_delta=access_token_expires
    )
    
    # Retorna o token JWT no cadastro bem-sucedido
    return {"access_token": access_token, "token_type": "bearer"}

def login_usuario(data: LoginData, db):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            "SELECT id, login, senha FROM usuarios WHERE login = %s;",
            (data.login,)
        )
        user = cursor.fetchone()

        # Verifica se o usuário existe e se a senha está correta
        if not user or not verify_password(data.senha, user['senha']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )

        # Cria o token JWT para o usuário autenticado
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user['login']},  # O "sub" contém o login do usuário
            expires_delta=access_token_expires
        )

        # Retorna o token JWT
        return {"access_token": access_token, "token_type": "bearer"}

# Função para obter um usuário pelo login
def get_user_by_login(db, login):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE login = %s;", (login,))
        return cursor.fetchone()

# Função para atualizar o saldo
def update_saldo(db, user_id, valor):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            UPDATE usuarios
            SET saldo = saldo + %s
            WHERE id = %s;
            """,
            (valor, user_id)
        )
        db.commit()
    return {"message": "Saldo updated successfully"}

# Função para obter o saldo do usuário
def get_saldo(db, user_id):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT saldo FROM usuarios WHERE id = %s;", (user_id,))
        saldo = cursor.fetchone()["saldo"]
    return {"saldo": saldo}

# Função para definir uma chave PIX para o usuário
def set_chave_pix(db, user_id, chave_pix):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            UPDATE usuarios
            SET chave_pix = %s
            WHERE id = %s;
            """,
            (chave_pix, user_id)
        )
        db.commit()
    return {"message": "Chave PIX updated successfully"}

# Função para obter um usuário pelo ID
def get_user_by_id(db, user_id):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE id = %s;", (user_id,))
        return cursor.fetchone()

# Função para retirar saldo
def retirar_saldo(db, user_id, valor):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        # Primeiro, buscamos o saldo atual do usuário
        cursor.execute(
            """
            SELECT saldo FROM usuarios
            WHERE id = %s;
            """,
            (user_id,)
        )
        user = cursor.fetchone()
        
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        saldo_atual = user['saldo']
        
        # Verificamos se o saldo atual é suficiente para retirar o valor desejado
        if saldo_atual < valor:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")
        
        # Subtraímos o valor do saldo
        cursor.execute(
            """
            UPDATE usuarios
            SET saldo = saldo - %s
            WHERE id = %s;
            """,
            (valor, user_id)
        )
        
        # Confirmando as mudanças
        db.commit()
        
    return {"message": "Saldo retirado com sucesso"}
