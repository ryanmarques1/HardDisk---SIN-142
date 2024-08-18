#Pegar token para fazer requisições ao Core
import json
import requests
#Requisição banco CORE
def requisicao_core():
        
        try:
            headers = {'Content-Type': 'application/json'}
            payload = {
                "instituicao_id": "5064897e-2e66-4ca3-ba4b-b7fe0b48618b",
                "instituicao_secret": "$2b$12$Cea4mD6FUagDXiiJfqmNw.rupw8CrE0av832niu/xkGtfDly/tRHu"
            }
            
            response = requests.post('http://projetosdufv.live/auth', json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            print(f'Httpamsnajsn {http_err}')
        except:
            print(f'Other ijauahs {http_err}')

global_token = None
def puxa_token():
    global global_token
    response = requisicao_core()
    try:
        global_token = response.get("access_token")
    except json.JSONDecodeError:
        global_token = None
    
def printa_token():
    global global_token
    return global_token