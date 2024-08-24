import requests
import time
from threading import Thread

class CoreService:
    def __init__(self, login_url, instituicao_id, instituicao_secret):
        self.login_url = login_url
        self.instituicao_id = instituicao_id
        self.instituicao_secret = instituicao_secret
        self.token = None
        self.expiration_time = None

    def login(self):
        response = requests.post(self.login_url, json={"instituicao_id": self.instituicao_id, "instituicao_secret": self.instituicao_secret})
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            self.expiration_time = time.time() + response.json().get("validateTime")
            print("Login successful, token acquired.")
        else:
            raise Exception("Failed to login to Central Bank API")

    def revalidate_token(self):
        while True:
            time_to_sleep = self.expiration_time - time.time()
            if time_to_sleep > 0:
                time.sleep(time_to_sleep)
            self.login()  # Revalida o token
            print("Token revalidated successfully.")

    def get_token(self):
        if not self.token or time.time() > self.expiration_time:
            self.login()
        return self.token
