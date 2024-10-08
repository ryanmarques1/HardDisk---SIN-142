import pika
import os
import logging

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', '179.189.94.124')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 9080))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', '9d67c2ce-c0e4-4656-bbb8-dd8ff5cc94fd')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'Vini@Calvo2024')

logging.basicConfig(level=logging.INFO)

def get_rabbitmq_connection():
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
        parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        logging.info(f"Conexão com RabbitMQ estabelecida com sucesso no host {RABBITMQ_HOST} e porta {RABBITMQ_PORT}.")
        return connection, channel
    except Exception as e:
        logging.error(f"Erro ao conectar com RabbitMQ no host {RABBITMQ_HOST} e porta {RABBITMQ_PORT}: {e}")
        raise e
    
def get_rabbitmq_connection_core_service():
    try:
        credentials = pika.PlainCredentials('user', 'password')
        parameters = pika.ConnectionParameters(host='rabbitmq', port=5672, credentials=credentials)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        logging.info(f"Conexão com RabbitMQ estabelecida com sucesso no host rabbitmq e porta 5672.")
        return connection, channel
    except Exception as e:
        logging.error(f"Erro ao conectar com RabbitMQ no host rabbitmq e porta 5672: {e}")
        raise e

