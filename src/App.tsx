import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { Container } from '@mui/material';
import { TurnTesting } from './app/views';

function App() {
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <TurnTesting />
      </Container>
    </ThemeProvider>
  );
}

export default App;
