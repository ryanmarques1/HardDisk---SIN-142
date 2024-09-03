from app.services.coreServices import CoreService

# Configurações da API do Banco Central
central_bank_login_url = "https://projetosdufv.live/auth"
instituicao_id = "4786a354-b336-4c47-a47a-b2e1ea10fc29"
instituicao_secret = "$2b$12$Cea4mD6FUagDXiiJfqmNw.rupw8CrE0av832niu/xkGtfDly/tRHu"

# Inicializar o serviço de token como uma variável global
token_service = CoreService(central_bank_login_url, instituicao_id, instituicao_secret)
