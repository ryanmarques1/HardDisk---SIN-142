import React, { useState } from "react";
import { useSession } from "next-auth/react";
import api from "../../api/axios";
import { BasicContainer, Box, Input, Button, Label, Select } from "./styles";

export const PixCard: React.FC = () => {
  const { data: session } = useSession();
  const [pixKey, setPixKey] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [message, setMessage] = useState<string>(""); 

  const handleConfirm = async (): Promise<void> => {
    if (session?.user?.id) {
      const requestBody = {
        usuario_id: session?.user?.id,
        chave_pix: pixKey,
        valor: amount,
        user_id_core:"f0a42262-9d6f-41be-8b87-678f76a20bd5"
      };
      try {
        const response = await api.post(`/transacao`,
          requestBody,
          {
            headers: 
            {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        if (response.data.sucesso) {
          setMessage("Transferência realizada com sucesso!"); // Mensagem de sucesso
        } else {
          setMessage(`Erro: ${response.data.mensagem || "Falha ao processar a transação."}`);
        }
      } catch (error) {
        setMessage("Ocorreu um erro ao tentar processar a transação.");
      }
    };
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    const numericValue = rawValue ? parseFloat(rawValue) / 100 : "";
    setAmount(numericValue);
  };

  const formatCurrency = (value: number | ""): string => {
    if (value === "") return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPixKey = (key: string, type: string): string => {
    switch (type) {
      case "CPF":
        return key.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      case "Email":
        return key; // Email geralmente não precisa de formatação
      case "Telefone":
        return key.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
      case "Chave Aleatoria":
        return key; // Chave aleatória geralmente não precisa de formatação
      default:
        return key;
    }
  };

  return (
    <BasicContainer>
      <Box>
        <Label htmlFor="option">Tipo de Chave</Label>
        <Select
          id="option"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="">Selecione uma opção</option>
          <option value="CPF">CPF</option>
          <option value="Email">E-mail</option>
          <option value="Telefone">Telefone</option>
          <option value="Chave Aleatoria">Chave Aleatória</option>
        </Select>
      </Box>

      <Box>
        <Label htmlFor="pixKey">Chave PIX</Label>
        <Input
          type="text"
          id="pixKey"
          value={formatPixKey(pixKey, selectedOption)}
          onChange={(e) => setPixKey(e.target.value)}
          placeholder="Insira a chave PIX"
          disabled={!selectedOption} // Disable input if no option is selected
        />
      </Box>
      
      <Box>
        <Label htmlFor="amount">Valor</Label>
        <Input
          type="text"
          id="amount"
          value={formatCurrency(amount)}
          onChange={handleAmountChange}
          placeholder="Insira o valor"
        />
      </Box>
      
      <Button onClick={handleConfirm}>Confirmar</Button>

      <Box>
        { message && <p>{message}</p>}
      </Box>
    </BasicContainer>
  );
};
