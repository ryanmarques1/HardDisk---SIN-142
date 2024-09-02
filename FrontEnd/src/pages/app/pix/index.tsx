import { AccountSession } from "../../../components/AccountSession";
import { PixCard } from "../../../components/Cards/pix";
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
          <PixCard/>
      </Funcionalitys>
    </Container>
  )
}

export default Dashboard