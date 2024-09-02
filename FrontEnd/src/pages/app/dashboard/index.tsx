import { AccountSession } from "../../../components/AccountSession";
import { CreditCard } from "../../../components/Cards";
import { History } from "../../../components/Cards/history";
import { Header } from "../../../components/Header";
import { Menu } from "../../../components/Menu";
import { ShortcutsSession } from "../../../components/ShortcutsSession";
import { Container, Funcionalitys, Grid } from "./style"

const Dashboard = () => {

  return(
    <Container>
      <Header />
      {
      //<AccountSession />
      }
      <ShortcutsSession />
      <Funcionalitys>
        <Menu />
        <Grid>
          <CreditCard />
          <History />
        </Grid>
      </Funcionalitys>
    </Container>
  )
}

export default Dashboard