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
  data_nasc: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  cell: string;
};

const ScrollableDiv = styled.div`
  max-height: 90vw; /* Define a altura máxima para o scroll */
  overflow-y: auto; /* Ativa o scroll vertical */
  padding-top: 80vh;
  padding-bottom: 5vh;
`;

export const FormCadastro = ({ errorMessage, onRegister }: FormCadastroProps) => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sobrenome: '',
    data_nasc: '',
    cpf: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceitarTermos: false,
    cell: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.sobrenome) newErrors.sobrenome = 'Sobrenome é obrigatório';
    if (!formData.data_nasc) newErrors.data_nasc = "Data de Nascimento é obrigatório"
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = 'As senhas não coincidem';
    if (!formData.aceitarTermos)
      newErrors.aceitarTermos = 'Você deve aceitar os termos de uso';
    if (!formData.cell) newErrors.cell = 'Número de celular é obrigatório';

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
          name="data_nasc"
          label="Data de Nascimento"
          onInputChange={(v) => handleInputChange('data_nasc', v)}
          value={formData.data_nasc}
          error={errors.data_nasc}
        />
        <TextInput
          name="cpf"
          label="CPF"
          onInputChange={(v) => handleInputChange('cpf', v)}
          value={formData.cpf}
          error={errors.cpf}
        />
        <TextInput
          name="cell"
          label="Celular"
          onInputChange={(v) => handleInputChange('cell', v)}
          value={formData.cell}
          error={errors.cell}
          type="password"
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
