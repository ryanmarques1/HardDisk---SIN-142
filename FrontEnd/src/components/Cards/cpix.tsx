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
    // Fetch chaves PIX da API quando o componente é montado
    const fetchKeys = async () => {
      if (session?.user?.id) {
        try {
          const response = await api.get(`/chave_pix`, {
            params: { user_id: session.user.id },
            headers: {
              Authorization: `Bearer ${session?.accessToken}`, // Incluindo o token de acesso
            },
          });
          setKeys(response.data.map((item: any) => ({ type: item.tipo_chave, key: item.chave_pix })));
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

  const handleRegister = (): void => {
    if (selectedOption && pixKey) {
      const existingKey = keys.find(key => key.type === selectedOption);

      if (existingKey) {
        setErrorMessage(`Já existe uma chave registrada para o tipo ${selectedOption}.`);
      } else {
        const newKey: PixKey = { type: selectedOption, key: pixKey };
        setKeys([...keys, newKey]);
        setSelectedOption("");
        setPixKey(""); // Limpa o campo de chave após o registro
        setErrorMessage(""); // Limpa a mensagem de erro se o registro for bem-sucedido
      }
    }
  };

  const generateRandomKey = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const formatPixKey = (key: string, type: string): string => {
    switch (type) {
      case "cpf":
        return key.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      case "Email":
      case "Telefone":
        return key; // Sem formatação adicional necessária
      case "Chave Aleatoria":
        return key; // Chave aleatória sem formatação adicional
      default:
        return key;
    }
  };

  const handleDelete = (index: number): void => {
    const updatedKeys = keys.filter((_, i) => i !== index);
    setKeys(updatedKeys);
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
          disabled={selectedOption === "Chave Aleatoria"} // Desabilita o campo de chave PIX apenas se a opção Chave Aleatória for selecionada
        />
      </Box>
      
      <Box>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} {/* Exibe a mensagem de erro */}
      </Box>

      <Button onClick={handleRegister}>Registrar Chave</Button>

      <TitleRK>Chaves Registradas</TitleRK>
      <Box>
        <KeyList>
          {keys.map((keyItem, index) => (
            <KeyItem key={index}>
              <span>{keyItem.type}: {formatPixKey(keyItem.key, keyItem.type)}</span>
              <DeleteButton onClick={() => handleDelete(index)}>Deletar</DeleteButton>
            </KeyItem>
          ))}
        </KeyList>
      </Box>
    </BasicContainer>
  );
};
