import React, { useState } from 'react';
import { TextInput } from '../TextInput';
import * as Styled from '../../../styles/Login/LoginComponents/FormLogin';
import { Button } from '../Button';
import styled from 'styled-components';

export type FormCadastroProps = {
  errorMessage?: string;
  onRegister?: (formData: FormData) => Promise<void>;
};

export type FormData = {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
};

const ScrollableDiv = styled.div`
  max-height: 90vw; /* Define a altura máxima para o scroll */
  overflow-y: auto; /* Ativa o scroll vertical */
  padding-top: 50vh;
  padding-bottom: 5vh;
`;

export const FormCadastro = ({ errorMessage, onRegister }: FormCadastroProps) => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sobrenome: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceitarTermos: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório';
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = 'As senhas não coincidem';
    if (!formData.aceitarTermos)
      newErrors.aceitarTermos = 'Você deve aceitar os termos de uso';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    if (onRegister) {
      await onRegister(formData);
    }

    setLoading(false);
  };

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  return (
    <Styled.Wrapper onSubmit={handleSubmit}>
      <ScrollableDiv className='FormL'>
        <h1>Cadastro de Usuário</h1>

        <TextInput
          name="nome"
          label="Nome"
          onInputChange={(v) => handleInputChange('nome', v)}
          value={formData.nome}
          error={errors.nome}
        />
        <TextInput
          name="sobrenome"
          label="Sobrenome"
          onInputChange={(v) => handleInputChange('sobrenome', v)}
          value={formData.sobrenome}
          error={errors.sobrenome}
        />
        <TextInput
          name="cpf"
          label="CPF"
          onInputChange={(v) => handleInputChange('cpf', v)}
          value={formData.cpf}
          error={errors.cpf}
        />
        <TextInput
          name="email"
          label="Email"
          onInputChange={(v) => handleInputChange('email', v)}
          value={formData.email}
          error={errors.email}
          type="email"
        />
        <TextInput
          name="senha"
          label="Senha"
          onInputChange={(v) => handleInputChange('senha', v)}
          value={formData.senha}
          error={errors.senha}
          type="password"
        />
        <TextInput
          name="confirmarSenha"
          label="Confirmar Senha"
          onInputChange={(v) => handleInputChange('confirmarSenha', v)}
          value={formData.confirmarSenha}
          error={errors.confirmarSenha}
          type="password"
        />
        {errors.aceitarTermos && (
          <Styled.ErrorMessage>{errors.aceitarTermos}</Styled.ErrorMessage>
        )}

        {!!errorMessage && (
          <Styled.ErrorMessage>{errorMessage}</Styled.ErrorMessage>
        )}

        <Styled.ButtonWrapper>
          <Button disabled={loading}>
            {loading ? 'Aguarde...' : 'Cadastrar'}
          </Button>
        </Styled.ButtonWrapper>
      </ScrollableDiv>
    </Styled.Wrapper>
  );
};
