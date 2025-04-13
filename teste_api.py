import requests

url = "https://lia-stylee-backend.vercel.app/api/chat"
payload = {
    "message": "Quero uma bolsa preta elegante para sair à noite"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Resposta da API:", response.text)
