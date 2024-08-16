#Pegar token para fazer requisições ao Core
import json
import requests
#Requisição banco CORE
def loginI():
        
        try:
            headers = {'Content-Type': 'application/json'}
            payload = {
                '': '1',
                '': '12'
            }
            
            response = requests.post('http://179.189.94.124/auth', json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            print(f'Httpamsnajsn {http_err}')
        except:
            print(f'Other ijauahs {http_err}')

token = "0"
global_token = None
def puxa_token():
    global global_token
    response = loginI()
    try:
        global_token = response.get("token")
    except json.JSONDecodeError:
        global_token = None
    
def printa_token():
    global global_token
    return global_token