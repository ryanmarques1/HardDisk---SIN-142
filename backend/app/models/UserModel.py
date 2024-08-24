from pydantic import BaseModel

class CadastroData(BaseModel):
    nome: str
    cpf: str
    data_nascimento: str
    login: str
    senha: str
    tel: str

class LoginData(BaseModel):
    login: str
    senha: str

class ValorData(BaseModel):
    valor: float

class ChavePixData(BaseModel):
    chave_pix: str

class TransferenciaData(BaseModel):
    chave_pix_destino: str
    valor: float