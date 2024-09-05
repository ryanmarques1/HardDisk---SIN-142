const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let accessToken = null;
let validateTime = null; // Validade do token em segundos

const login_url = "https://projetosdufv.live";
const instituicao_id = "9d67c2ce-c0e4-4656-bbb8-dd8ff5cc94fd";
const instituicao_secret = "Vini@Calvo2024";

const RABBITMQ_URL = `amqp://user:password@rabbitmq`;
const QUEUE_IN = 'core_request_queue';  // Fila de entrada
const QUEUE_OUT = 'core_response_queue';  // Fila de saída

// Função para fazer login e obter o token
async function login() {
    try {
        const response = await axios.post(`${login_url}/auth`, {
            instituicao_id,
            instituicao_secret
        });
        
        if (response.status === 200) {
            console.log('Login bem-sucedido');
            accessToken = response.data.access_token;
            validateTime = response.data.validateTime;

            console.log(`Token recebido: ${accessToken}`);
            console.log(`Validade do token: ${validateTime} segundos`);

            // Atualizar o token automaticamente após 'validateTime' segundos
            setTimeout(login, validateTime * 1000);
        } else {
            throw new Error('Falha no login');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        throw new Error('Erro ao fazer login');
    }
}

// Função para criar chave PIX
async function create_pix_key(chave_pix, tipo_chave, user_id) {
    try {
        const response = await axios.post(
            `${login_url}/chave_pix/`,
            {
                chave_pix,
                tipo_chave,
                usuario_id: user_id,
                instituicao_id
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        if (response.status !== 200) {
            throw new Error("Erro ao criar a chave PIX no core");
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

// Função para deletar chave PIX
async function delete_pix_key(chave_pix) {
    try {
        const response = await axios.delete(
            `${login_url}/chave_pix/${chave_pix}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        if (response.status !== 200) {
            throw new Error("Erro ao deletar a chave PIX no core");
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

// Função para solicitar transação
async function request_transacao_core(user_id_core, chave_pix, valor) {
    try {
        const response = await axios.post(
            `${login_url}/transacao`,
            {
                usuario_id: user_id_core,
                instituicao_id,
                chave_pix,
                valor
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        if (response.status !== 200) {
            throw new Error(`Erro ao efetuar transação no core: ${response.data}`);
        }
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
}

// Função para consumir a fila e processar operações
async function consumeQueue() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_IN, { durable: true });

        console.log(`Esperando mensagens na fila: ${QUEUE_IN}`);

        channel.consume(QUEUE_IN, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                const requestData = JSON.parse(messageContent);
                let result;

                try {
                    if (requestData.operation === 'create_pix') {
                        result = await create_pix_key(requestData.chave_pix, requestData.tipo_chave, requestData.user_id);
                    } else if (requestData.operation === 'delete_pix') {
                        result = await delete_pix_key(requestData.chave_pix);
                    } else if (requestData.operation === 'transacao') {
                        result = await request_transacao_core(requestData.user_id_core, requestData.chave_pix, requestData.valor);
                    } else {
                        throw new Error('Operação inválida');
                    }

                    // Enviar resposta para a fila de saída
                    await channel.assertQueue(QUEUE_OUT, { durable: true });
                    channel.sendToQueue(QUEUE_OUT, Buffer.from(JSON.stringify(result)));
                    console.log(`Resposta enviada para a fila: ${QUEUE_OUT}`);

                } catch (error) {
                    console.error('Erro no processamento:', error.message);
                    const errorMessage = { error: error.message };
                    await channel.assertQueue(QUEUE_OUT, { durable: true });
                    channel.sendToQueue(QUEUE_OUT, Buffer.from(JSON.stringify(errorMessage)));
                }

                // Confirmar que a mensagem foi processada
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Erro ao conectar no RabbitMQ:', error.message);
    }
}

// Rota de saúde (para verificar se a API está rodando)
app.get('/health', (req, res) => {
    res.json({ status: 'API funcionando' });
});

// Inicializar o servidor Express
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
    console.log(`API rodando na porta ${PORT}`);
    
    // Fazer login ao iniciar a aplicação
    await login();

    // Iniciar o consumo da fila RabbitMQ
    consumeQueue();
});
