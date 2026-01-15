import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { AppRouter } from "./routing/AppRouter";
import myTheme from "./styles/theme";


export default function App() {
  return (
    <MantineProvider theme={myTheme} >
        <Notifications/>
        <AppRouter/>
    </MantineProvider>    
  );
}
