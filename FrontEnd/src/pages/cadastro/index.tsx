import { signIn } from 'next-auth/react';
import { useRouter } from 'next/dist/client/router';
import { useState } from 'react';
import { FormCadastro } from '../../components/Cadastro/FormLogin';
import { Wrapper } from '../../components/Cadastro/Wrapper';

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  type FormData = {
    nome: string;
    sobrenome: string;
    cpf: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    aceitarTermos: boolean;
  };

  const handleLogin = async (formData: FormData) => {
    const response = await signIn('credentials', {
      formData,
      redirect: false,
    });

    if (!response?.ok) {
      setError('Usuário ou senha inválidos');
      return;
    }

    const redirect = router.query?.redirect || '/';
    router.push('/app/home');
  };

  return (
    <Wrapper>
      <FormCadastro onRegister={handleLogin} errorMessage={error} />
    </Wrapper>
  );
}