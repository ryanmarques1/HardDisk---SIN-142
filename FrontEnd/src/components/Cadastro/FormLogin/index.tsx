import React, { useState } from 'react';
import { TextInput } from '../TextInput';
import * as Styled from '../../../styles/Login/LoginComponents/FormLogin';
import { Button } from '../Button';
import styled from 'styled-components';
import { validateCPF, validateEmail } from './validators'; // Importing validation functions

export type FormCadastroProps = {
  errorMessage?: string;
  onRegister?: (formData: FormData) => Promise<void>;
};

export type FormData = {
  nome: string;
  data_nascimento: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  tel: string;
};

const ScrollableDiv = styled.div`
  max-height: 90vw;
  overflow-y: auto;
  padding-top: 80vh;
  padding-bottom: 5vh;
`;

export const FormCadastro = ({ errorMessage, onRegister }: FormCadastroProps) => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    data_nascimento: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    aceitarTermos: false,
    tel: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de Nascimento é obrigatória';
    if (!formData.cpf) newErrors.cpf = 'CPF é obrigatório';
    else if (!validateCPF(formData.cpf.replace(/\D/g, ''))) newErrors.cpf = 'CPF inválido';

    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido';

    if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = 'As senhas não coincidem';
    if (!formData.aceitarTermos)
      newErrors.aceitarTermos = 'Você deve aceitar os termos de uso';
    if (!formData.tel) newErrors.tel = 'Número de celular é obrigatório';

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
    let formattedValue = value as string;

    setFormData((prevData) => ({ ...prevData, [name]: formattedValue }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
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
          name="data_nascimento"
          label="Data de Nascimento"
          onInputChange={(v) => handleInputChange('data_nascimento', v)}
          value={formData.data_nascimento}
          error={errors.data_nascimento}
          type="text" // Set type to text to use custom formatting
        />
        <TextInput
          name="cpf"
          label="CPF"
          onInputChange={(v) => handleInputChange('cpf', v)}
          value={formData.cpf}
          error={errors.cpf}
          type="text" // Set type to text to use custom formatting
        />
        <TextInput
          name="tel"
          label="Celular"
          onInputChange={(v) => handleInputChange('tel', v)}
          value={formData.tel}
          error={errors.tel}
          type="text" // Set type to text to use custom formatting
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

        <label>
          <input
            type="checkbox"
            name="aceitarTermos"
            checked={formData.aceitarTermos}
            onChange={(e) => handleInputChange('aceitarTermos', e.target.checked)}
          />
          Aceitar os Termos e Condições
        </label>

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
