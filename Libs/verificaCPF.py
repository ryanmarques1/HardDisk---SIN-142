#Função de verificar cpf válido.
def ehCpf(cpf):
    s1 = 2
    s2 = 3
    soma1= 0
    soma2=0
    i = 8
    while i>=0:
        soma1+=s1*(int(cpf[i]))
        soma2+=s2*(int(cpf[i]))
        i-=1
        s1+=1
        s2+=1
    if soma1%11>=2:
        x1=11-(soma1%11)
    else:
        x1 = 0
    soma2+=x1*2

    if soma2%11>=2:
        x2=11-(soma2%11)
    else:
        x2=0
    n1 = int(cpf[10])
    n2 = int(cpf[11])

    if x1 == n2 and x2 == n2 and cpf[9] == '-':
        print("Cpf valido, prossiga")
    else:
        print("Cpf invalido")    
        