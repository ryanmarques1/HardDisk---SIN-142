from fastapi import FastAPI, HTTPException, Depends, status
from validate_docbr import CPF
from psycopg2.extras import RealDictCursor
from datetime import timedelta, datetime
from app.services.auth import create_access_token, verify_password, get_password_hash
from app.models.UserModel import CadastroData, LoginData, ValorData, ChavePixData, TransferenciaData
from app.services.coreServices import CoreService

ACCESS_TOKEN_EXPIRE_MINUTES = 1800

def cadastrar_usuario(data: CadastroData, db):
    cpf_v = CPF()
    
    # Verifica se o CPF é válido
    if not cpf_v.validate(data.cpf):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid CPF")
    
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        # Verifica se o login já existe no banco de dados
        cursor.execute("SELECT * FROM usuarios WHERE email = %s;", (data.email,))
        user = cursor.fetchone()
        if user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Login already exists")

        # Converte a data de 'dd/mm/yyyy' para 'yyyy-mm-dd'
        try:
            data_nascimento = datetime.strptime(data.data_nascimento, "%d/%m/%Y").strftime("%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format")

        # Hash da senha antes de armazenar no banco de dados
        hashed_password = get_password_hash(data.senha)
        
        # Insere o novo usuário no banco de dados
        cursor.execute(
            """
            INSERT INTO usuarios (nome, cpf, data_nascimento, email, senha, tel)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id;
            """,
            (data.nome, data.cpf, data_nascimento, data.email, hashed_password, data.tel)
        )
        
        user_id = cursor.fetchone()["id"]
        db.commit()
    
    # Gera o token JWT para o novo usuário
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": data.email},  # "sub" contém o login do usuário
        expires_delta=access_token_expires
    )
    
    # Retorna o token JWT no cadastro bem-sucedido
    return {"access_token": access_token, "token_type": "bearer"}

def login_usuario(data: LoginData, db):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            "SELECT id, email, senha, nome, cpf, data_nascimento, tel FROM usuarios WHERE email = %s;",
            (data.email,)
        )
        user = cursor.fetchone()

        # Verifica se o usuário existe e se a senha está correta
        if not user or not verify_password(data.password, user['senha']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid login credentials"
            )

        # Cria o token JWT para o usuário autenticado
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user['email']},  # O "sub" contém o login do usuário
            expires_delta=access_token_expires
        )

        # Retorna o token JWT
        return {
            "jwt": access_token,
            "data": {
                "id": user['id'],
                "email": user['email'],
                "nome": user['nome'],
                "cpf": user['cpf'],
                "data_nascimento": user['data_nascimento'],
                "tel": user['tel']
            }
        }

# Função para obter um usuário pelo login
def get_user_by_login(db, login):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM usuarios WHERE login = %s;", (login,))
        return cursor.fetchone()

# Função para atualizar o saldo
def update_saldo(db, user_id, valor):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            # Atualiza o saldo do usuário
            cursor.execute(
                """
                UPDATE usuarios
                SET saldo = saldo + %s
                WHERE id = %s;
                """,
                (valor, user_id)
            )
            
            # Insere um registro na tabela de operações
            cursor.execute(
                """
                INSERT INTO operacoes (tipo, user_id, valor)
                VALUES (%s, %s, %s);
                """,
                ("credito" if valor > 0 else "debito", user_id, valor)
            )
            
            # Confirma as transações
            db.commit()
            
            return {"message": "Saldo updated and operation recorded successfully"}
        except Exception as e:
            db.rollback()
            return {"error": str(e)}


# Função para obter o saldo do usuário
def get_saldo(db, user_id):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT saldo FROM usuarios WHERE id = %s;", (user_id,))
        saldo = cursor.fetchone()["saldo"]
    return {"saldo": saldo}

def get_operacoes(db, user_id):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT id, tipo, user_id, valor, data_operacoes
            FROM operacoes
            WHERE user_id = %s
            ORDER BY data_operacoes DESC;
            """,
            (user_id,)
        )
        operacoes = cursor.fetchall()
        if not operacoes:
            raise HTTPException(status_code=404, detail="No operations found for this user")
        return operacoes

# Função para definir uma chave PIX para o usuário
def set_chave_pix(db, user_id, tipo_chave, chave_pix, user_id_core, core_service: CoreService):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            # Primeiro, tenta criar a chave no core
            result = core_service.create_pix_key(chave_pix, tipo_chave, user_id_core)

            # Se o core retornar sucesso, insere a nova chave PIX no banco de dados privado
            cursor.execute(
                """
                INSERT INTO chave_pix (user_id, tipo_chave, chave_pix, chave_pix_id_core)
                VALUES (%s, %s, %s, %s);
                """,
                (user_id, tipo_chave, chave_pix, result['data']['id'])
            )
            db.commit()
            return {"message": "Chave PIX cadastrada com sucesso"}
        except Exception as e:
            db.rollback()
            return {"error": str(e)}

# Função para deletar uma chave PIX
def delete_chave_pix(db, chave_pix, user_id, core_service: CoreService):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        try:
            cursor.execute("SELECT * FROM chave_pix WHERE user_id = %s AND chave_pix = %s;", (user_id, chave_pix))
            resposta = cursor.fetchone()
            chave_pix_id_core = resposta.get('chave_pix_id_core')
            # Primeiro, tenta deletar a chave no core
            core_service.delete_pix_key(chave_pix_id_core)

            # Se o core retornar sucesso, deleta a chave PIX no banco de dados privado
            cursor.execute(
                """
                DELETE FROM chave_pix WHERE user_id = %s AND chave_pix = %s;
                """,
                (user_id, chave_pix)
            )
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Chave PIX não encontrada")
            db.commit()
            return {"message": "Chave PIX deletada com sucesso"}
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

# Função para obter um usuário pelo ID do usuario
def get_chave_pix_by_user_id(db, user_id):
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM chave_pix WHERE user_id = %s;", (user_id,))
        return cursor.fetchall()

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
