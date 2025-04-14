import { ThemeProvider, createTheme } from '@mui/material';
import XmlForm from './components/XmlForm';
import './App.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <XmlForm />
    </ThemeProvider>
  );
}

export default App;
