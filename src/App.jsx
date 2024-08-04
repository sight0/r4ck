import './App.css'
import { useState, useEffect } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RackVisualization from './components/RackVisualization';
import InitialSetupForm from './components/InitialSetupForm';
import PatchSchedule from './components/PatchSchedule';
import { calculateInterIdfConnections } from './utils/rackUtils';

const App = () => {
    const [setupComplete, setSetupComplete] = useState(false);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [currentIdf, setCurrentIdf] = useState(1);
    const [connections, setConnections] = useState([]);
    const [rackDesigns, setRackDesigns] = useState({});
    const [interIdfConnections, setInterIdfConnections] = useState({});
    const [allComponents, setAllComponents] = useState({});

    const theme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#ffffff',
            },
            secondary: {
                main: '#bdbdbd', // New accent color (golden)
            },
            background: {
                default: '#303030',
                paper: '#424242',
            },
        },
    });

    const handleSetupSubmit = (formData) => {
        setNetworkInfo(formData);
        setSetupComplete(true);
    };

    const handleAddConnection = (connection) => {
        setConnections([...connections, connection]);
    };

    const handleSaveRackDesign = (idf, design) => {
        setRackDesigns(prevDesigns => ({
            ...prevDesigns,
            [idf]: design
        }));
        setAllComponents(prevAll => ({
            ...prevAll,
            [idf]: design
        }));
        
        // Recalculate inter-IDF connections
        const newInterIdfConnections = calculateInterIdfConnections(design, idf);
        setInterIdfConnections(prev => ({
            ...prev,
            [idf]: newInterIdfConnections[idf]
        }));
    };

    const handleUpdateInterIdfConnections = (newConnections) => {
        setInterIdfConnections(newConnections);
    };

    const handlePortChange = (idf, componentId, portIndex, field, value) => {
        setAllComponents(prevAll => {
            const newComponents = prevAll[idf].map(comp => {
                if (comp.id === componentId) {
                    const newPorts = [...comp.ports];
                    newPorts[portIndex] = { ...newPorts[portIndex], [field]: value };
                    return { ...comp, ports: newPorts };
                }
                return comp;
            });

            // Recalculate inter-IDF connections
            const newInterIdfConnections = calculateInterIdfConnections(newComponents, idf);

            // Update the inter-IDF connections state
            setInterIdfConnections(prev => ({
                ...prev,
                [idf]: newInterIdfConnections[idf]
            }));

            return {
                ...prevAll,
                [idf]: newComponents
            };
        });
    };

    useEffect(() => {
        if (networkInfo) {
            const initialRackDesigns = {};
            for (let i = 1; i <= networkInfo.numIdfs; i++) {
                initialRackDesigns[i] = [];
            }
            setRackDesigns(initialRackDesigns);
        }
    }, [networkInfo]);

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
                                numIdfs={networkInfo.numIdfs}
                                idfData={networkInfo.idfData}
                                onAddConnection={handleAddConnection}
                                rackDesign={rackDesigns[currentIdf] || []}
                                onSaveRackDesign={(design) => handleSaveRackDesign(currentIdf, design)}
                                interIdfConnections={interIdfConnections}
                                onUpdateInterIdfConnections={handleUpdateInterIdfConnections}
                                onPortChange={(componentId, portIndex, field, value) => 
                                    handlePortChange(currentIdf, componentId, portIndex, field, value)}
                            />
                            <PatchSchedule connections={connections} />
                        </Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;

