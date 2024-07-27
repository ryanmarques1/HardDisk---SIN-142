
""""
from banco_privado import *

def mostrar_menu():
    print("\nBem-vindo ao Banco Privado!")
    print("1. Abrir conta")
    print("2. Fechar conta")
    print("3. Fazer depósito")
    print("4. Fazer saque")
    print("5. Fazer transferência")
    print("6. Comunicar com outro banco privado")
    print("7. Consumir mensagens de outro banco privado")
    print("8. Sair")

def executar_opcao(opcao):
    if opcao == '1':
        cliente_id = str(uuid.uuid4())
        saldo_inicial = float(input("Informe o saldo inicial da conta: "))
        abrir_conta(cliente_id, saldo_inicial)
    elif opcao == '2':
        cliente_id = input("Informe o ID do cliente para fechar a conta: ")
        fechar_conta(cliente_id)
    elif opcao == '3':
        cliente_id = input("Informe o ID do cliente para fazer o depósito: ")
        valor = float(input("Informe o valor do depósito: "))
        fazer_deposito(cliente_id, valor)
    elif opcao == '4':
        cliente_id = input("Informe o ID do cliente para fazer o saque: ")
        valor = float(input("Informe o valor do saque: "))
        fazer_saque(cliente_id, valor)
    elif opcao == '5':
        origem_id = input("Informe o ID da conta de origem: ")
        destino_id = input("Informe o ID da conta de destino: ")
        valor = float(input("Informe o valor da transferência: "))
        fazer_transferencia(origem_id, destino_id, valor)
    elif opcao == '6':
        mensagem = input("Informe a mensagem para enviar ao outro banco privado: ")
        comunicar_com_outros_bancos(mensagem)
    elif opcao == '7':
        consumir_mensagens_de_outros_bancos()
    elif opcao == '8':
        print("Saindo...")
        return False
    else:
        print("Opção inválida. Por favor, escolha uma opção válida.")
    return True

if __name__ == "__main__":
    continuar = True
    while continuar:
        mostrar_menu()
        opcao = input("Escolha uma opção: ")
        continuar = executar_opcao(opcao)
"""