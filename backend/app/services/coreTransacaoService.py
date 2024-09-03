from fastapi import FastAPI, HTTPException
from app.services.rabbitmq import get_rabbitmq_connection
import pika
import json
import logging

# Substitua pelo ID da sua instituição
instituicao_id = "9d67c2ce-c0e4-4656-bbb8-dd8ff5cc94fd"

TRANSACTION_QUEUE = f'transaction_{instituicao_id}_queue'
TRANSACTION_RESPONSE_QUEUE = f'transaction_{instituicao_id}_response_queue'

logging.basicConfig(level=logging.INFO)

connection, channel = get_rabbitmq_connection()
channel.queue_declare(queue=TRANSACTION_QUEUE, durable=True)
channel.queue_declare(queue=TRANSACTION_RESPONSE_QUEUE, durable=True)

def processar_transacao(ch, method, properties, body):
    try:
        transacao = json.loads(body)
        
        # Extrai os dados da transação
        usuario_origem = transacao["usuario_origem"]
        usuario_destino = transacao["usuario_destino"]
        instituicao_origem = transacao["instituicao_origem"]
        instituicao_destino = transacao["instituicao_destino"]
        chave_pix = transacao["chave_pix"]
        tipo_chave = transacao["tipo_chave"]
        valor = transacao["valor"]
        
        # Lógica de processamento da transação
        logging.info(f"Processando transação na fila {TRANSACTION_QUEUE} para a instituição {instituicao_id}: {transacao}")
        
        # Simulação de processamento com sucesso
        sucesso = True

        # Construir a resposta
        response = {
            "sucesso": sucesso,
            "mensagem": "Transação processada com sucesso" if sucesso else "Falha ao processar a transação"
        }
        
        # Enviar a resposta para a fila de resposta
        channel.basic_publish(
            exchange='',
            routing_key=TRANSACTION_RESPONSE_QUEUE,
            body=json.dumps(response),
            properties=pika.BasicProperties(correlation_id=properties.correlation_id)
        )

        # Confirma o processamento da mensagem
        if sucesso:
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    except Exception as e:
        logging.error(f"Erro ao processar a transação: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
