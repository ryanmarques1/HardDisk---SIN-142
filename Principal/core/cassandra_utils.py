from cassandra.cluster import Cluster

cluster = Cluster(['127.0.0.1'])
session = cluster.connect()

session.execute("CREATE KEYSPACE IF NOT EXISTS bancos WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 1}")
session.execute("USE bancos")
session.execute("CREATE TABLE IF NOT EXISTS contas (cliente_id text PRIMARY KEY, saldo float)")

def iniciar_conta_bancaria(cliente_id, saldo_inicial):
    session.execute("INSERT INTO contas (cliente_id, saldo) VALUES (%s, %s)", (cliente_id, saldo_inicial))

def encerrar_conta_bancaria(cliente_id):
    session.execute("DELETE FROM contas WHERE cliente_id = %s", (cliente_id,))

def deposito(cliente_id, valor):
    session.execute("UPDATE contas SET saldo = saldo + %s WHERE cliente_id = %s", (valor, cliente_id))

def saque(cliente_id, valor):
    session.execute("UPDATE contas SET saldo = saldo - %s WHERE cliente_id = %s IF saldo >= %s", (valor, cliente_id, valor))

def transferencia(origem_id, destino_id, valor):
    session.execute("BEGIN BATCH \
                    UPDATE contas SET saldo = saldo - %s WHERE cliente_id = %s IF saldo >= %s; \
                    UPDATE contas SET saldo = saldo + %s WHERE cliente_id = %s; \
                    APPLY BATCH", (valor, origem_id, valor, valor, destino_id))
