from uuid import uuid4
import pika
import json
from fastapi import HTTPException
from app.services.rabbitmq import get_rabbitmq_connection_core_service

CORE_REQUEST_QUEUE = 'core_request_queue'
CORE_RESPONSE_QUEUE = 'core_response_queue'


# Função para enviar mensagem e aguardar a resposta via RabbitMQ
def enviar_mensagem_para_fila_e_aguardar_resposta(action: str, data: dict):
    try:
        connection, channel = get_rabbitmq_connection_core_service()
        channel.queue_declare(queue=CORE_REQUEST_QUEUE, durable=True)
        channel.queue_declare(queue=CORE_RESPONSE_QUEUE, durable=True)

        correlation_id = str(uuid4())

        message = {
            "action": action,
            **data
        }

        # Enviar a mensagem para a fila de requisição
        channel.basic_publish(
            exchange='',
            routing_key=CORE_REQUEST_QUEUE,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                reply_to=CORE_RESPONSE_QUEUE,
                correlation_id=correlation_id,
                delivery_mode=2,  # Persistente
            )
        )

        response = None

        # Callback para tratar a resposta
        def on_response(ch, method, properties, body):
            nonlocal response
            if properties.correlation_id == correlation_id:
                response = json.loads(body)
                ch.basic_ack(delivery_tag=method.delivery_tag)

        # Consumir a fila de resposta
        channel.basic_consume(queue=CORE_RESPONSE_QUEUE, on_message_callback=on_response)

        # Esperar a resposta
        while response is None:
            connection.process_data_events()

        connection.close()
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao enviar mensagem para o RabbitMQ: {e}")


# Serviço para criar chave PIX
def create_pix_key(chave_pix: dict):
    data = {
        "data": chave_pix
    }
    return enviar_mensagem_para_fila_e_aguardar_resposta("create_pix", data)


# Serviço para deletar chave PIX
def delete_pix_key(chave_pix: str):
    data = {
        "chave_pix": chave_pix
    }
    return enviar_mensagem_para_fila_e_aguardar_resposta("delete_pix", data)


# Serviço para realizar transação
def request_transacao_core(user_id_core: str, chave_pix: str, valor: float):
    data = {
        "usuario_id": user_id_core,
        "chave_pix": chave_pix,
        "valor": valor,
        "instituicao_id": "9d67c2ce-c0e4-4656-bbb8-dd8ff5cc94fd"  # Instituição ID fixa
    }
    return enviar_mensagem_para_fila_e_aguardar_resposta("transacao", data)