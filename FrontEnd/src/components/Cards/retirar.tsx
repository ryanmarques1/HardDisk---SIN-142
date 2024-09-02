import React, { useState } from "react";
import { BasicContainer, Box, Input, Button, Label } from "./styles";
import { useSession } from "next-auth/react";
import api from "../../api/axios"; // Assumindo que você tem uma instância de axios configurada
import { getSaldo } from "../../utils/saldo";

export const DepositoCard: React.FC = () => {
  const { data: session } = useSession();
  const usuario = session?.user;
  const [pixKey, setPixKey] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState<string>(""); // Estado para a mensagem de sucesso
  const [unsuccessMessage, setUnsuccessMessage] = useState<string>(""); // Estado para a mensagem de sucesso
  const saldoAtual = getSaldo();

  const handleConfirm = async (): Promise<void> => {
    if (amount !== "" && usuario?.id) {      
      if(await saldoAtual >= amount){
        try {
          const response = await api.put("/update-saldo", {
            user_id: usuario.id,  // Usando o ID do usuário da sessão
            valor: -amount,
          },
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
          });
          setSuccessMessage("Saque realizado com sucesso!"); // Atualiza a mensagem de sucesso
          console.log("Saldo atualizado com sucesso:", response.data);
        } catch (error) {
          console.error("Erro ao atualizar o saldo:", error);
          setSuccessMessage(""); // Limpa a mensagem de sucesso em caso de erro
          setUnsuccessMessage("");
        }
      }else{
        setSuccessMessage("");
        setUnsuccessMessage("Valor de saque indisponível!");
      }
    } else {
      console.log("Por favor, insira um valor válido.");
      setSuccessMessage(""); // Limpa a mensagem de sucesso se o valor for inválido
      setUnsuccessMessage("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    const numericValue = rawValue ? parseFloat(rawValue) / 100 : "";
    setAmount(numericValue);
    console.log("Numeric value:", numericValue); // Debugging: Verifica o valor numérico
  };
;
  const formatCurrency = (value: number | ""): string => {
    if (value === "") return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <BasicContainer>
      <Box>
        <Label htmlFor="amount">Valor do Saque</Label>
        <Input
          type="text"
          id="amount"
          value={formatCurrency(amount)}
          onChange={handleChange}
          placeholder="Insira o valor"
        />
      </Box>

      <Box>
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>} {/* Exibe a mensagem de sucesso */}
        {unsuccessMessage && <p style={{ color: "red" }}>{unsuccessMessage}</p>} {/* Exibe a mensagem de sucesso */}
      </Box>

      <Button onClick={handleConfirm}>Retirar</Button>

    </BasicContainer>
  );
};
