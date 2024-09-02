import { useRouter } from 'next/router'
import { signOut } from "next-auth/react"
import { SignOutButton } from "../Buttons"
import { Container } from "./style"

export const Header = () => {
  const router = useRouter()
  const currentPath = router.pathname

  // Define os nomes das páginas com base no caminho
  const pageName = (() => {
    switch (currentPath) {
      case '/app/dashboard':
        return 'DashBoard'
      case '/app/pix':
        return 'Área Pix'
      case '/app/cpix':
        return 'Cadastrar Pix'
      case '/app/deposito':
        return 'Realizar Depósito'
      case '/app/retirar':
        return 'Realizar Saque'
      // Adicione mais casos conforme necessário
      default:
        return 'Page'
    }
  })()

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/', // Redireciona para '/' após o signOut ser concluído
    })
  }

  return (
    <Container>
      <img src='/calvologoE.svg' alt='nubank'/>
      <h1>{pageName}</h1>
      <SignOutButton onClick={handleSignOut} />
    </Container>
  )
}
