from pydantic import BaseModel

class CadastroData(BaseModel):
    nome: str
    cpf: str
    data_nascimento: str
    email: str
    senha: str
    tel: str

class LoginData(BaseModel):
    email: str
    password: str

class SaldoData(BaseModel):
    user_id: int
    valor: float

class ValorData(BaseModel):
    valor: float

class ChavePixData(BaseModel):
    user_id: int
    chave_pix: str
    tipo_chave: str

class PixKeyRequest(BaseModel):
    chave_pix: str
    tipo_chave: str
    user_id: int
    user_id_core: str

class DeleteChavePixData(BaseModel):
    user_id: int
    chave_pix: str

class TransferenciaData(BaseModel):
    usuario_id: int
    chave_pix: str
    valor: float
    user_id_core: str