import './App.css'
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme, Typography, useMediaQuery, CircularProgress } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RackVisualization from './components/RackVisualization';
import InitialSetupForm from './components/InitialSetupForm';
import WorkspaceManager from './components/WorkspaceManager';
import { calculateInterIdfConnections } from './utils/rackUtils';
import { getCookie } from './utils/cookieUtils';

const App = () => {
    const [setupComplete, setSetupComplete] = useState(false);
    const workspaceManagerRef = useRef(null);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [currentIdf, setCurrentIdf] = useState(1);
    const [connections, setConnections] = useState([]);
    const [connectionsPerIdf, setConnectionsPerIdf] = useState({});
    const [rackDesigns, setRackDesigns] = useState({});
    const [interIdfConnections, setInterIdfConnections] = useState({});
    const [allComponents, setAllComponents] = useState({});
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const lastSavedStateRef = useRef(null);

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    useEffect(() => {
        const loadInitialWorkspace = async () => {
            const lastSavedWorkspace = getCookie('lastSavedWorkspace');
            if (lastSavedWorkspace) {
                await handleLoadWorkspace({ name: lastSavedWorkspace });
            } else {
                // If no workspace is saved in cookie, load the most recent workspace
                const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
                if (workspaces.length > 0) {
                    await handleLoadWorkspace(workspaces[workspaces.length - 1]);
                }
            }
            setIsLoading(false);
        };
        loadInitialWorkspace();
    }, []);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                    primary: {
                        main: prefersDarkMode ? '#d2ecff' : '#173958',
                    },
                    secondary: {
                        main: prefersDarkMode ? '#4b44ed' : '#dc004e',
                    },
                    background: {
                        default: prefersDarkMode ? '#303030' : '#f5f5f5',
                        paper: prefersDarkMode ? '#424242' : '#ffffff',
                    },
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                            },
                        },
                    },
                },
            }),
        [prefersDarkMode],
    );

    const handleSetupSubmit = (formData) => {
        setNetworkInfo(formData);
        setSetupComplete(true);
    
        // Initialize allComponents for all IDFs
        const initialComponents = {};
        for (let i = 1; i <= formData.numIdfs; i++) {
            initialComponents[i] = [];
        }
        setAllComponents(initialComponents);

        // Open the save workspace dialog
        setTimeout(() => {
            if (workspaceManagerRef.current) {
                workspaceManagerRef.current.openSaveDialog();
            } else {
                console.error("WorkspaceManager ref is not available");
            }
        }, 0);
    };

    const checkForChanges = useCallback(() => {
        const currentState = JSON.stringify({
            setupComplete,
            networkInfo,
            currentIdf,
            connections,
            connectionsPerIdf,
            rackDesigns,
            interIdfConnections,
            allComponents
        });
        
        if (lastSavedStateRef.current !== null) {
            // console.log('Checking for changes:');
            // console.log('Current state:', currentState);
            // console.log('Last saved state:', lastSavedStateRef.current);
            const hasChanges = currentState !== lastSavedStateRef.current;
            // console.log('Has changes:', hasChanges);
            setHasUnsavedChanges(hasChanges);
        }
    }, [setupComplete, networkInfo, currentIdf, connections, connectionsPerIdf, rackDesigns, interIdfConnections, allComponents]);

    useEffect(() => {
        checkForChanges();
    }, [checkForChanges]);

    const handleSaveWorkspace = useCallback((name) => {
        // console.log('handleSaveWorkspace called with name:', name);
        return new Promise((resolve) => {
            const workspaceData = {
                setupComplete,
                networkInfo,
                currentIdf,
                connections,
                connectionsPerIdf,
                rackDesigns,
                interIdfConnections,
                allComponents
            };
            const workspace = {
                name: name || currentWorkspace,
                data: workspaceData
            };
            const savedWorkspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
            const existingIndex = savedWorkspaces.findIndex(w => w.name === workspace.name);
            if (existingIndex !== -1) {
                savedWorkspaces[existingIndex] = workspace;
            } else {
                savedWorkspaces.push(workspace);
            }
            localStorage.setItem('workspaces', JSON.stringify(savedWorkspaces));
            setCurrentWorkspace(workspace.name);
            const newSavedState = JSON.stringify(workspaceData);
            lastSavedStateRef.current = newSavedState;
            // console.log('New saved state:', newSavedState);
            setHasUnsavedChanges(false);
            // console.log('handleSaveWorkspace completed');
            setTimeout(() => resolve(), 500); // Simulate a short delay for saving
        });
    }, [setupComplete, networkInfo, currentIdf, connections, connectionsPerIdf, rackDesigns, interIdfConnections, allComponents, currentWorkspace]);

    const handleLoadWorkspace = async (workspace) => {
        if (workspace && workspace.name) {
            try {
                const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
                const fullWorkspace = workspaces.find(w => w.name === workspace.name);
                if (fullWorkspace && fullWorkspace.data) {
                    const { data } = fullWorkspace;
                    setSetupComplete(data.setupComplete);
                    setNetworkInfo(data.networkInfo);
                    setCurrentIdf(data.currentIdf);
                    setConnections(data.connections);
                    setConnectionsPerIdf(data.connectionsPerIdf);
                    setRackDesigns(data.rackDesigns);
                    setInterIdfConnections(data.interIdfConnections);
                    setAllComponents(data.allComponents);
                    setCurrentWorkspace(workspace.name);
                    const loadedState = JSON.stringify(data);
                    lastSavedStateRef.current = loadedState;
                    // console.log('Loaded state:', loadedState);
                    setHasUnsavedChanges(false);
                    // console.log('Workspace loaded, lastSavedStateRef updated');
                } else {
                    console.error('Workspace data not found:', workspace.name);
                    // Optionally, show an error message to the user
                }
            } catch (error) {
                console.error('Error loading workspace:', error);
                // Optionally, show an error message to the user
            }
        } else {
            console.error('Invalid workspace object:', workspace);
            // Optionally, show an error message to the user
        }
    };

    const handleNewWorkspace = () => {
        if (confirm("Are you sure you want to start a new workspace? This will clear all current data.")) {
            setSetupComplete(false);
            setNetworkInfo(null);
            setCurrentIdf(1);
            setConnections([]);
            setConnectionsPerIdf({});
            setRackDesigns({});
            setInterIdfConnections({});
            setAllComponents({});
            setCurrentWorkspace(null);
        }
    };

    const handleAddConnection = useCallback((connection) => {
        setConnectionsPerIdf(prev => ({
            ...prev,
            [currentIdf]: [...(prev[currentIdf] || []), connection]
        }));
    }, [currentIdf]);

    const handleUpdateConnection = useCallback((updatedConnection) => {
        setConnectionsPerIdf(prev => ({
            ...prev,
            [currentIdf]: prev[currentIdf].map(conn => 
                conn.id === updatedConnection.id ? updatedConnection : conn
            )
        }));
    }, [currentIdf]);

    // const handleDeleteConnection = useCallback((connectionId) => {
    //     setConnectionsPerIdf(prev => ({
    //         ...prev,
    //         [currentIdf]: prev[currentIdf].filter(conn => conn.id !== connectionId)
    //     }));
    // }, [currentIdf]);
    const handleDeleteConnection = (connectionId) => {
        setConnectionsPerIdf(prev => {
            const newConnections = { ...prev };
            if (typeof connectionId === 'number') {
                newConnections[connectionId] = [];
            } else {
                // If connectionId is not a number, it's a specific connection ID
                Object.keys(newConnections).forEach(idfId => {
                    newConnections[idfId] = newConnections[idfId].filter(conn => conn.id !==
                        connectionId);
                });
            }
            return newConnections;
        });
    };

    const handleSaveRackDesign = useCallback((idf, design) => {
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
    }, []);

    const handleUpdateInterIdfConnections = useCallback((newConnections) => {
        setInterIdfConnections(prevConnections => ({
            ...prevConnections,
            ...newConnections
        }));
    }, []);

    const handlePortChange = useCallback((idf, componentId, portIndex, field, value) => {
        setAllComponents(prevAll => {
            const idfComponents = prevAll[idf] || [];
            const newComponents = idfComponents.map(comp => {
                if (comp.id === componentId) {
                    const newPorts = [...(comp.ports || [])];
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
    }, []);

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
                <Header>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontStyle: 'italic' }}>
                            {currentWorkspace ? `Current Workspace: ${currentWorkspace}` : 'Unsaved Workspace'}
                        </Typography>
                        <WorkspaceManager
                            ref={workspaceManagerRef}
                            onSaveWorkspace={handleSaveWorkspace}
                            onLoadWorkspace={handleLoadWorkspace}
                            onNewWorkspace={handleNewWorkspace}
                            currentWorkspace={currentWorkspace}
                            hasUnsavedChanges={hasUnsavedChanges}
                        />
                    </Box>
                </Header>
                {isLoading ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : !setupComplete ? (
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
                                onUpdateConnection={handleUpdateConnection}
                                onDeleteConnection={handleDeleteConnection}
                                rackDesign={rackDesigns[currentIdf] || []}
                                onSaveRackDesign={(design) => handleSaveRackDesign(currentIdf, design)}
                                interIdfConnections={interIdfConnections}
                                onUpdateInterIdfConnections={handleUpdateInterIdfConnections}
                                onPortChange={(componentId, portIndex, field, value) => 
                                    handlePortChange(currentIdf, componentId, portIndex, field, value)}
                                connectionsPerIdf={connectionsPerIdf}
                                allComponents={allComponents}
                                setAllComponents={setAllComponents}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;

