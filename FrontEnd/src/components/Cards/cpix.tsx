import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import api from "../../api/axios";
import { BasicContainer, Box, Input, Button, Label, Select, KeyList, KeyItem, DeleteButton, TitleRK } from "./styles";

interface PixKey {
  type: string;
  key: string;
}

export const PixRegister: React.FC = () => {
  const [pixKey, setPixKey] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { data: session } = useSession();

  useEffect(() => {
    const fetchKeys = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/chave_pix`, {
            params: { user_id: session.user.id },
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          });
          setKeys(response.data.map((item: any) => ({ type: item.tipo_chave, key: item.chave_pix})));
        } catch (error) {
          console.error("Erro ao buscar chaves PIX:", error);
        }
      }
    };

    fetchKeys();
  }, [session]);

  useEffect(() => {
    if (selectedOption === "Chave Aleatoria") {
      const randomKey = generateRandomKey();
      setPixKey(randomKey);
    } else {
      setPixKey(""); // Limpa a chave se outra opção for selecionada
    }
  }, [selectedOption]);

  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (): Promise<void> => {
    if (selectedOption && pixKey) {
      const existingKey = keys.find(key => key.type === selectedOption);

      if (existingKey) {
        setErrorMessage(`Já existe uma chave registrada para o tipo ${selectedOption}.`);
        return;
      }

      if (selectedOption === "CPF" && !validateCPF(pixKey)) {
        setErrorMessage("CPF inválido. Por favor, insira um CPF válido.");
        return;
      }

      if (selectedOption === "Email" && !validateEmail(pixKey)) {
        setErrorMessage("E-mail inválido. Por favor, insira um E-mail válido.");
        return;
      }

      try {
        const response = await api.post(
          `/chave_pix`,
          {
            tipo_chave: selectedOption,
            chave_pix: pixKey,
            user_id: session?.user?.id,
            user_id_core: "f0a42262-9d6f-41be-8b87-678f76a20bd5",
          },
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );

        const newKey: PixKey = { type: selectedOption, key: pixKey };
        setKeys([...keys, newKey]);
        setSelectedOption("");
        setPixKey(""); // Limpa o campo de chave após o registro
        setErrorMessage(""); // Limpa a mensagem de erro se o registro for bem-sucedido
      } catch (error) {
        console.error("Erro ao registrar a chave PIX:", error);
        setErrorMessage("Erro ao registrar a chave PIX. Tente novamente.");
      }
    }
  };

  const generateRandomKey = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const formatPixKey = (key: string, type: string): string => {
    switch (type) {
      case "CPF":
        return key.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      case "Email":
      case "Telefone":
        return key;
      case "Chave Aleatoria":
        return key;
      default:
        return key;
    }
  };

  const handleDelete = async (index: number): Promise<void> => {
    const keyToDelete = keys[index];
    try {
      await api.delete(`/chave_pix`, {
        data: { chave_pix: keyToDelete.key, user_id: session?.user?.id },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const updatedKeys = keys.filter((_, i) => i !== index);
      setKeys(updatedKeys);
    } catch (error) {
      console.error("Erro ao deletar a chave PIX:", error);
      setErrorMessage("Erro ao deletar a chave PIX. Tente novamente.");
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
          disabled={selectedOption === "Chave Aleatoria"}
        />
      </Box>

      <Box>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </Box>

      <Button onClick={handleRegister}>Registrar Chave</Button>

      <TitleRK>Chaves Registradas</TitleRK>
      <Box>
        {keys.length === 0 ? (
          <KeyItem style={{width: "100%"}}>
            <span style={{color: "#a3a3a3"}}>Nenhuma chave PIX cadastrada.</span>
          </KeyItem>
        ) : (
          <KeyList>
            {keys.map((keyItem, index) => (
              <KeyItem key={index}>
                <span>{keyItem.type}: {formatPixKey(keyItem.key, keyItem.type)}</span>
                <DeleteButton onClick={() => handleDelete(index)}>Deletar</DeleteButton>
              </KeyItem>
            ))}
          </KeyList>
        )}
      </Box>
    </BasicContainer>
  );
};
