import './App.css'
import { useState } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RackVisualization from './components/RackVisualization';
import InitialSetupForm from './components/InitialSetupForm';

const theme = createTheme({
    palette: {
        primary: {
            main: '#ffffff',
        },
        secondary: {
            main: '#beb8b8',
        },
    },
});

const App = () => {
    const [setupComplete, setSetupComplete] = useState(false);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [currentIdf, setCurrentIdf] = useState(1);

    const handleSetupSubmit = (formData) => {
        setNetworkInfo(formData);
        setSetupComplete(true);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Header />
                {!setupComplete ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <InitialSetupForm onSubmit={handleSetupSubmit} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                        <Box sx={{ width: 250, flexShrink: 0 }}>
                            <Sidebar currentIdf={currentIdf} />
                        </Box>
                        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
                            <RackVisualization 
                                currentIdf={currentIdf} 
                                setCurrentIdf={setCurrentIdf}
                                totalIdfs={networkInfo.idfs}
                                idfUsers={networkInfo.idfUsers}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;

