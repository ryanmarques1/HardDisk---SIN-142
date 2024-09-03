import { useState } from "react";
import { signIn } from "next-auth/react";
import api from "../../api/axios";
import { Wrapper } from '../../components/Cadastro/Wrapper';
import { FormCadastro, FormData } from '../../components/Cadastro/FormLogin';

export default function CadastroPage() {
  const [error, setError] = useState<string | undefined>(undefined);

  const getFilteredData = (data: FormData) => {
    const { nome, cpf, data_nascimento, email, senha, tel } = data;
    return { nome, cpf, data_nascimento, email, senha, tel };
  };

  const handleCadastro = async (formData: FormData) => {
    setError(undefined);
  
    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    const filteredData = getFilteredData(formData);
  
    try {
      const response = await api.post("/cadastro", filteredData);
  
      console.log(response); // Verifique a resposta aqui
  
      if (response.data) {
        // Loga automaticamente após o cadastro
        const result: any = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.senha,
        });
  
        if (result.error) {
          setError(result.error);
        } else {
          window.location.href = "/";
        }
      }
    } catch (error:any) {
      if (error.response) {
        console.error("Erro de validação:", error.response.data);
        setError(error.response.data.message || "Erro ao tentar cadastrar");
      } else {
        console.error("Erro ao tentar cadastrar:", error);
        setError("Erro ao tentar cadastrar");
      }
    }
  };
  

  return (
    <Wrapper>
      <FormCadastro onRegister={handleCadastro} errorMessage={error} />
    </Wrapper>
  );
}
