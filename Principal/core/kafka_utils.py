from kafka import KafkaProducer, KafkaConsumer

bootstrap_servers = ['localhost:9092']
topic = 'transacoes'

def produzir_mensagem(mensagem):
    producer = KafkaProducer(bootstrap_servers=bootstrap_servers)
    producer.send(topic, mensagem.encode('utf-8'))
    producer.flush()

def consumir_mensagens():
    consumer = KafkaConsumer(topic, group_id='my_group', bootstrap_servers=bootstrap_servers)
    for message in consumer:
        print(f"Mensagem recebida: {message.value.decode('utf-8')}")
