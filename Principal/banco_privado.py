import uuid
from core.cassandra_utils import iniciar_conta_bancaria, encerrar_conta_bancaria, deposito, saque, transferencia
from core.kafka_utils import produzir_mensagem, consumir_mensagens

def abrir_conta(cliente_id, saldo_inicial):
    iniciar_conta_bancaria(cliente_id, saldo_inicial)

def fechar_conta(cliente_id):
    encerrar_conta_bancaria(cliente_id)

def fazer_deposito(cliente_id, valor):
    deposito(cliente_id, valor)

def fazer_saque(cliente_id, valor):
    saque(cliente_id, valor)

def fazer_transferencia(origem_id, destino_id, valor):
    transferencia(origem_id, destino_id, valor)

def comunicar_com_outros_bancos(mensagem):
    produzir_mensagem(mensagem)

def lidar_com_mensagem(mensagem):
    print(f"Mensagem recebida do outro banco privado: {mensagem}")

def consumir_mensagens_de_outros_bancos():
    consumir_mensagens()

if __name__ == "__main__":
    cliente_id = str(uuid.uuid4())
    abrir_conta(cliente_id, 1000.0)
    fazer_deposito(cliente_id, 500.0)
    fazer_saque(cliente_id, 200.0)
    fechar_conta(cliente_id)

    mensagem = "Exemplo de mensagem para outro banco privado"
    comunicar_com_outros_bancos(mensagem)
    consumir_mensagens_de_outros_bancos()
