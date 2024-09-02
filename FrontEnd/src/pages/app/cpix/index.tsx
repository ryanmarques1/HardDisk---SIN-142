import { AccountSession } from "../../../components/AccountSession";
import { PixRegister } from "../../../components/Cards/cpix";
import { Header } from "../../../components/Header";
import { Menu } from "../../../components/Menu";
import { ShortcutsSession } from "../../../components/ShortcutsSession";
import { Container, Funcionalitys, Grid} from "./style"

const Dashboard = () => {
  return(
    <Container>
      <Header />
      {
      //<AccountSession />
      }
      <ShortcutsSession />
      <Funcionalitys>
        {/* <Menu /> */}
          <PixRegister/>
      </Funcionalitys>
    </Container>
  )
}

export default Dashboard