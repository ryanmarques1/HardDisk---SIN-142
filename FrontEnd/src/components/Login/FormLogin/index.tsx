import React, { useEffect, useState } from 'react';
//import EmailIcon from '@material-ui/icons/Email';
//import LockIcon from '@material-ui/icons/Lock';

import { TextInput } from '../TextInput';
import * as Styled from '../../../styles/Login/LoginComponents/FormLogin';
import { Button } from '../Button';
import { Pagina } from '../../../styles/Login';
import { useRouter } from 'next/dist/client/router';
import styled, { css } from 'styled-components';
import { ButtonProps } from '../../../components/Login/Button';


export type FormLoginProps = {
  errorMessage?: string;
  onLogin?: (email: string, password: string) => Promise<void>;
};

const ButtonCadastro = styled.button<Pick<any, 'color'>>`
  ${({ theme, color }) => css`
    background: trasparent;
    border: none;
    color: '${theme.colors.white}';
    font-size: ${theme.font.sizes.normal};
    padding: ${theme.spacings.xsmall} ${theme.spacings.medium};
    cursor: pointer;
    border-radius: ${theme.spacings.tiny};
    transition: ${theme.transitions.fast};
    display: flex;
    align-items: center;
    justify-content: center;
    marginTop: 100px;
    &:focus {
      outline: none;
      box-shadow: 0 0 ${theme.spacings.tiny} ${theme.colors.gray9};
      filter: brightness(110%);
    }
    &:hover {
      filter: brightness(90%);
    }
    &:disabled {
      background: ${theme.colors.gray4};
      color: ${theme.colors.gray1};
      cursor: not-allowed;
      &:hover {
        filter: none;
      }
    }
  `}
`;

export const FormLogin = ({ errorMessage, onLogin }: FormLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {

    setLoading(true);
    event.preventDefault();

    if (onLogin) {
      await onLogin(email, password);
    }

    setLoading(false);
  };

  return (
    <Styled.Wrapper onSubmit={handleSubmit}>
      <div className='FormL'>
        <h1>Login Usuario</h1>
        <TextInput
          name="user-identifier"
          label="Seu e-mail"
          onInputChange={(v) => setEmail(v)}
          value={email}
          //icon={<EmailIcon />}
          type="email"
        />
        <TextInput
          name="user-password"
          label="Sua senha"
          onInputChange={(v) => setPassword(v)}
          value={password}
          //icon={<LockIcon />}
          type="password"
        />

        {!!errorMessage && (
          <Styled.ErrorMessage>{errorMessage}</Styled.ErrorMessage>
        )}

        <Styled.ButtonWrapper>
          <Button disabled={loading}>{loading ? 'Aguarde...' : 'Entrar'}</Button>
        </Styled.ButtonWrapper>
        
        <div style={{marginTop: "40px "}}>
          <ButtonCadastro onClick={() => router.push('/cadastro')} disabled={loading}>{loading ? 'Aguarde...' : 'Cadastre-se'}</ButtonCadastro>
        </div>
      </div>
    </Styled.Wrapper>
  );
};