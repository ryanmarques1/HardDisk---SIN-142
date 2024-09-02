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


class TransferenciaData(BaseModel):
    chave_pix_destino: str
    valor: float