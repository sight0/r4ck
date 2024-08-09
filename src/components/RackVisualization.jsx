import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { calculateInterIdfConnections } from '../utils/rackUtils';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Grid, Paper, Divider, IconButton, Badge, Tooltip, MenuItem, Container } from '@mui/material';
import IssuesDialog from './IssuesDialog';
import PatchingSchedule from './PatchingSchedule';
import GetAppIcon from '@mui/icons-material/GetApp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CableIcon from '@mui/icons-material/Cable';
import RecommendIcon from '@mui/icons-material/Recommend';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RackComponent from './RackComponent';
import ComponentConfigDialog from './ComponentConfigDialog';
import ConnectionWizard from './ConnectionWizard';
import { components as sidebarComponents } from './Sidebar';

const componentColors = Object.fromEntries(sidebarComponents.map(comp => [comp.type, comp.color]));

const GreenButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.success.main,
    '&:hover': {
        backgroundColor: theme.palette.success.dark,
    },
    '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
    },
}));

const StyledRackContainer = styled(Box)({
    position: 'relative',
    '& .rack-units': {
        position: 'absolute',
        left: '5px',
        width: '25px',
        textAlign: 'right',
        fontSize: '10px',
        color: '#999'
    },
});

const StyledIdfButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'isActive'
})(({ theme, isActive }) => ({
    margin: theme.spacing(1),
    minWidth: '80px',
    backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

const StyledMdfButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    minWidth: '100px',
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
    },
}));

const StyledLine = styled('div')(({ theme }) => ({
    width: '2px',
    backgroundColor: theme.palette.grey[400],
    margin: '0 auto',
}));

const RackVisualization = ({ currentIdf, setCurrentIdf, numIdfs, idfData, interIdfConnections, onUpdateInterIdfConnections, onPortChange }) => {
    const [connections, setConnections] = useState([]);
    const [componentSequences, setComponentSequences] = useState({});
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [totalDevices, setTotalDevices] = useState(0);

    useEffect(() => {
        // Calculate total devices for the current IDF
        const devices = idfData[currentIdf]?.devices || [];
        const total = devices.reduce((sum, device) => sum + device.count, 0);
        setTotalDevices(total);
    }, [currentIdf, idfData]);

    const handleSaveWorkspace = () => {
        // Implement save workspace functionality
        console.log('Saving workspace...');
    };

    const handleLoadWorkspace = () => {
        // Implement load workspace functionality
        console.log('Loading workspace...');
    };

    const handleAutoPlacement = () => {
        // Implement auto placement functionality
        console.log('Auto placing components...');
    };

    const handleAutoWiring = () => {
        // Implement auto wiring functionality
        console.log('Auto wiring components...');
    };

    const getNextSequence = (type) => {
        const existingSequences = components
            .filter(comp => comp.type === type)
            .map(comp => comp.sequence)
            .sort((a, b) => a - b);

        let nextSequence = 1;
        for (const seq of existingSequences) {
            if (seq !== nextSequence) {
                return nextSequence;
            }
            nextSequence++;
        }
        return nextSequence;
    };

    const handleConnectionCreate = (newConnection) => {
        const deviceA = components.find(c => c.id === newConnection.deviceA.componentId);
        const deviceB = components.find(c => c.id === newConnection.deviceB.componentId);

        if (deviceA && deviceB) {
            const portAIndex = deviceA.ports.findIndex(p => p.label === newConnection.deviceA.port);
            const portBIndex = deviceB.ports.findIndex(p => p.label === newConnection.deviceB.port);

            if (portAIndex !== -1 && portBIndex !== -1) {
                onPortChange(newConnection.deviceA.componentId, portAIndex, 'connectedTo', newConnection.deviceB.componentId);
                onPortChange(newConnection.deviceA.componentId, portAIndex, 'connectedPort', newConnection.deviceB.port);

                onPortChange(newConnection.deviceB.componentId, portBIndex, 'connectedTo', newConnection.deviceA.componentId);
                onPortChange(newConnection.deviceB.componentId, portBIndex, 'connectedPort', newConnection.deviceA.port);

                // Set connection type
                const connectionType = deviceA.type === deviceB.type ? 'stacking' : 'standard';
                onPortChange(newConnection.deviceA.componentId, portAIndex, 'connectionType', connectionType);
                onPortChange(newConnection.deviceB.componentId, portBIndex, 'connectionType', connectionType);

                // Set device types
                onPortChange(newConnection.deviceA.componentId, portAIndex, 'connectedDeviceType', deviceB.type);
                onPortChange(newConnection.deviceB.componentId, portBIndex, 'connectedDeviceType', deviceA.type);

                // Add the new connection to the connections state
                setConnections(prevConnections => [...prevConnections, newConnection]);
            }
        }
    };

    const handleConnectionUpdate = (updatedConnection) => {
        setConnections(prevConnections => 
            prevConnections.map(conn => 
                conn.id === updatedConnection.id ? updatedConnection : conn
            )
        );
        // You may need to update the port connections here as well
    };

    const handleConnectionDelete = (connectionId) => {
        setConnections(prevConnections => 
            prevConnections.filter(conn => conn.id !== connectionId)
        );
        // You may need to update the port connections here as well
    };

    const handleExportSchedule = () => {
        // Implementation for exporting the schedule
        // This could involve generating a CSV or PDF file
        console.log("Exporting schedule...");
        // You can add your export logic here
    };
    const theme = useTheme();
    const [allComponents, setAllComponents] = useState({});
    const components = useMemo(() => allComponents[currentIdf] || [], [allComponents, currentIdf]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);
    const [editComponent, setEditComponent] = useState(null);
    const [recommendation, setRecommendation] = useState('');
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [placementIndicator, setPlacementIndicator] = useState(null);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [exhaustedPorts, setExhaustedPorts] = useState(0);
    const [highlightedType, setHighlightedType] = useState(null);
    const [issuesDialogOpen, setIssuesDialogOpen] = useState(false);
    const [connectionWizardOpen, setConnectionWizardOpen] = useState(false);
    const [recommendationsDialogOpen, setRecommendationsDialogOpen] = useState(false);
    const rackRef = useRef(null);
    
    const rackSize = idfData[currentIdf]?.rackSize || 42; // Use the specified rack size or default to 42U
    const rackHeight = rackSize * 20; // Each U is 20px tall
    const rackWidth = 298; // Adjust width for smaller racks
    const accentColor = theme.palette.secondary.main;

    const handleGetRecommendations = () => {
        // This function would analyze the current setup and requirements
        // and generate recommendations for switch models, etc.
        setRecommendationsDialogOpen(true);
    };

    const handleHighlight = (type) => {
        setHighlightedType(type);
    };

    useEffect(() => {
        // Calculate exhausted ports based on the number of patch panel components
        const patchPanelPorts = components.filter(c => c.type === 'patch_panel').reduce((total, panel) => total + parseInt(panel.capacity), 0);
        const totalPorts = idfData[currentIdf]?.ports || 0;
        setExhaustedPorts(Math.min(patchPanelPorts, totalPorts));

        // TODO: Implement actual recommendation logic
        setRecommendation('Recommendation: Add a 48-port switch for optimal performance.');
    }, [components, currentIdf, idfData]);

    useEffect(() => {
        const sequences = {};
        Object.values(allComponents).forEach(idfComponents => {
            idfComponents.forEach(comp => {
                if (!sequences[comp.type]) {
                    sequences[comp.type] = 0;
                }
                sequences[comp.type] = Math.max(sequences[comp.type], comp.sequence || 0);
            });
        });
        setComponentSequences(sequences);
    }, [allComponents]);


    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const componentData = e.dataTransfer.getData('text/plain');
        const component = JSON.parse(componentData);

        // Snap to grid
        const snappedY = Math.floor(y / 20) * 20;

        const newComp = {
            ...component,
            x: 30, // Adjusted to accommodate rack unit labels
            y: snappedY,
            id: Date.now(),
        };

        if (component.type === 'cable_manager') {
            // Instantly place cable manager
            const sequence = getNextSequence(component.type);
            newComp.name = `Cable Manager ${sequence}`;
            newComp.capacity = '1';
            newComp.units = 1;
            newComp.sequence = sequence;

            setAllComponents(prevAll => ({
                ...prevAll,
                [currentIdf]: [...(prevAll[currentIdf] || []), newComp]
            }));
            setComponentSequences(prevSequences => ({
                ...prevSequences,
                [component.type]: sequence
            }));
        } else {
            // For other components, open the dialog
            setNewComponent(newComp);
            setDialogOpen(true);
        }
        setPlacementIndicator(null);
    }, [currentIdf, getNextSequence]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const snappedY = Math.floor(y / 20) * 20;

        setPlacementIndicator({
            y: snappedY,
            height: 20, // Default height of 2U
        });
    }, []);

    const handleDialogClose = (name, capacity, units) => {
        if (name && capacity && units) {
            const sequence = getNextSequence(newComponent.type);
            const newComp = {
                ...newComponent,
                name,
                capacity,
                units: parseInt(units),
                sequence,
            };
            
            // Initialize ports for switches and patch panels
            if (newComp.type === 'switch' || newComp.type === 'patch_panel' || newComp.type === 'fiber_patch_panel') {
                const portCount = parseInt(capacity);
                newComp.ports = Array.from({ length: portCount }, (_, i) => ({
                    label: `Port ${i + 1}`,
                    cableSource: '',
                    connectedTo: '',
                    type: newComp.type === 'fiber_patch_panel' ? 'fiber' : 'copper'
                }));
            }
            
            // Check if the component fits within the rack
            if (newComp.y + newComp.units * 20 > rackHeight) {
                alert("The component doesn't fit within the rack. Please adjust the size or position.");
                return;
            }
            
            // Check for overlap with existing components
            const overlap = components.some(comp => 
                (newComp.y < comp.y + comp.units * 20) && 
                (newComp.y + newComp.units * 20 > comp.y)
            );

            if (!overlap) {
                setAllComponents(prevAll => {
                    const updatedIdf = [...(prevAll[currentIdf] || []), newComp];
                    return {
                        ...prevAll,
                        [currentIdf]: updatedIdf
                    };
                });
                setDialogOpen(false);
                setNewComponent(null);
            } else {
                alert("This position overlaps with an existing component. Please choose a different position.");
            }
        } else {
            setDialogOpen(false);
            setNewComponent(null);
        }
    };

    const handlePreviousIdf = () => {
        if (currentIdf > 1) {
            setCurrentIdf(currentIdf - 1);
            setComponents([]);
        }
    };

    const saveRackDesign = useCallback(() => {
        localStorage.setItem('rackDesigns', JSON.stringify(allComponents));
    }, [allComponents]);

    const loadRackDesigns = useCallback(() => {
        const savedDesigns = localStorage.getItem('rackDesigns');
        if (savedDesigns) {
            setAllComponents(JSON.parse(savedDesigns));
        }
    }, []);

    useEffect(() => {
        loadRackDesigns();
    }, [loadRackDesigns]);

    useEffect(() => {
        saveRackDesign();
    }, [allComponents, saveRackDesign]);

    const handleNextIdf = () => {
        if (currentIdf < numIdfs) {
            setCurrentIdf(currentIdf + 1);
        } else {
            alert("TODO: Implement MDF visualization");
        }
    };

    const handleComponentDragStart = useCallback((e, component) => {
        setDraggedComponent(component);
    }, []);

    const handleComponentDrag = useCallback((e) => {
        if (!draggedComponent) return;

        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const snappedY = Math.floor(y / 20) * 20;

        setDraggedComponent(prev => ({ ...prev, y: snappedY }));
    }, [draggedComponent]);

    const handleComponentDragEnd = useCallback(() => {
        if (!draggedComponent) return;

        const overlap = components.some(comp => 
            comp.id !== draggedComponent.id &&
            (draggedComponent.y < comp.y + comp.units * 20) && 
            (draggedComponent.y + draggedComponent.units * 20 > comp.y)
        );

        if (!overlap) {
            setAllComponents(prevAll => ({
                ...prevAll,
                [currentIdf]: prevAll[currentIdf].map(comp => 
                    comp.id === draggedComponent.id ? draggedComponent : comp
                )
            }));
        }

        setDraggedComponent(null);
    }, [draggedComponent, components, currentIdf]);

    const handleDeleteComponent = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this component? This will also delete any connections made with this component.");
        if (confirmDelete) {
            setAllComponents(prevAll => {
                const updatedComponents = prevAll[currentIdf].filter(comp => comp.id !== id);
                return {
                    ...prevAll,
                    [currentIdf]: updatedComponents
                };
            });

            // Update connections
            setConnections(prevConnections => 
                prevConnections.filter(conn => 
                    conn.deviceA.componentId !== id && conn.deviceB.componentId !== id
                )
            );

            // Recalculate inter-IDF connections
            const newInterIdfConnections = calculateInterIdfConnections(
                allComponents[currentIdf].filter(comp => comp.id !== id),
                currentIdf
            );
            onUpdateInterIdfConnections({
                ...interIdfConnections,
                [currentIdf]: newInterIdfConnections
            });
        }
    };

    const handleEditComponent = (component) => {
        setEditComponent({...component, deviceSequence: component.sequence});
        setConfigDialogOpen(true);
    };

    const handleConfigDialogClose = (updatedComponent) => {
        if (updatedComponent) {
            const overlap = components.some(comp => 
                comp.id !== updatedComponent.id &&
                (updatedComponent.y < comp.y + comp.units * 20) && 
                (updatedComponent.y + updatedComponent.units * 20 > comp.y)
            );

            if (!overlap) {
                setAllComponents(prevAll => {
                    const newComponents = prevAll[currentIdf].map(comp =>
                        comp.id === updatedComponent.id ? {
                            ...updatedComponent,
                            sequence: comp.sequence // Maintain the original sequence
                        } : comp
                    );
                    
                    // Recalculate inter-IDF connections for the current IDF
                    const newInterIdfConnections = calculateInterIdfConnections(newComponents, currentIdf);
                    
                    onUpdateInterIdfConnections({
                        ...interIdfConnections,
                        [currentIdf]: newInterIdfConnections
                    });
                    
                    return {
                        ...prevAll,
                        [currentIdf]: newComponents
                    };
                });
            } else {
                alert("The updated component overlaps with existing components. Please adjust the size or position.");
            }
        }
        setConfigDialogOpen(false);
        setEditComponent(null);
    };

    const handlePortChange = (componentId, portIndex, field, value) => {
        onPortChange(componentId, portIndex, field, value);
    };

    const getIssues = () => {
        let issues = [];

        // Get the required ports for this IDF
        const requiredPorts = idfData[currentIdf]?.devices || [];

        // Get all patch panel ports in this IDF
        const patchPanelPorts = components
            .filter(c => c.type === 'patch_panel')
            .flatMap(panel => panel.ports || []);

        // Check for each required port type
        requiredPorts.forEach(requirement => {
            const { type, count } = requirement;
            // console.log(patchPanelPorts);
            const allocatedPorts = patchPanelPorts.filter(port => port.cableSource === type).length;

            // This is terrible (should be passed with the idfData):
            const name = type.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            issues.push({
                message: `Allocate patch panel ports for ${type}: This IDF requires ${count} dedicated patch panel port(s) for ${name}(s).`,
                isSatisfied: allocatedPorts >= count,
                severity: 'high',
                solutionHint: allocatedPorts >= count
                    ? `All required ports are allocated for ${type}.`
                    : `Configure ${count - allocatedPorts} more port(s) for ${type}.`
            });
        });

        // Check for MDF connections
        const mdfConnections = interIdfConnections[currentIdf]?.MDF || 0;
        if (mdfConnections > 0) {
            const allocatedMdfPorts = patchPanelPorts.filter(port => port.cableSource === 'MDF').length;

            issues.push({
                message: `Allocate patch panel ports for connections to MDF: This IDF requires ${mdfConnections} dedicated patch panel port(s) for MDF connections.`,
                isSatisfied: allocatedMdfPorts >= mdfConnections,
                severity: 'high',
                solutionHint: allocatedMdfPorts >= mdfConnections
                    ? `All required ports are allocated for MDF connections.`
                    : `Configure ${mdfConnections - allocatedMdfPorts} more port(s) for MDF connections.`
            });
        }

        // Check for incoming connections from other IDFs
        Object.entries(interIdfConnections).forEach(([sourceIdf, connections]) => {
            if (sourceIdf !== currentIdf.toString() && connections) {
                const incomingConnections = connections[`IDF_${currentIdf}`] || 0;
                if (incomingConnections > 0) {
                    const allocatedIncomingPorts = patchPanelPorts.filter(port => port.cableSource === `IDF_${sourceIdf}`).length;
                    issues.push({
                        message: `Allocate patch panel ports for incoming connections from IDF ${sourceIdf}: This IDF needs to implement ${incomingConnections} dedicated patch panel port(s) to receive connections from IDF ${sourceIdf}.`,
                        isSatisfied: allocatedIncomingPorts >= incomingConnections,
                        severity: 'high',
                        solutionHint: allocatedIncomingPorts >= incomingConnections
                            ? `All required ports are allocated for incoming connections from IDF ${sourceIdf}.`
                            : `Configure ${incomingConnections - allocatedIncomingPorts} more port(s) for receiving connections from IDF ${sourceIdf}.`
                    });
                }
            }
        });

        return issues;
    };

    return (
        <Box className="rack-visualization-container">
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {currentIdf === numIdfs + 1 ? 'MDF' : `IDF ${currentIdf}`} Rack Design
                    </Typography>
                    <Box>
                        <IconButton onClick={handlePreviousIdf} disabled={currentIdf === 1}>
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        <IconButton onClick={handleNextIdf}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                    <Button
                        variant="contained"
                        color={getIssues().some(issue => !issue.isSatisfied) ? "error" : "primary"}
                        onClick={() => setIssuesDialogOpen(true)}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: 3,
                            '&:hover': {
                                boxShadow: 5,
                            },
                        }}
                        startIcon={<ErrorOutlineIcon />}
                    >
                        {getIssues().some(issue => !issue.isSatisfied) ? "View Issues" : "All Satisfied"}
                    </Button>
                    <Tooltip title={getIssues().some(issue => !issue.isSatisfied) ? "Satisfy all requirements to enable Connection Wizard" : "Open Connection Wizard"}>
                        <span>
                            <GreenButton
                                variant="contained"
                                onClick={() => setConnectionWizardOpen(true)}
                                disabled={getIssues().some(issue => !issue.isSatisfied)}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    boxShadow: 3,
                                    '&:hover': {
                                        boxShadow: 5,
                                    },
                                }}
                                startIcon={<CableIcon />}
                            >
                                Connection Wizard
                            </GreenButton>
                        </span>
                    </Tooltip>
                    <Button
                        variant="contained"
                        onClick={handleGetRecommendations}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: 3,
                            backgroundColor: '#424242',
                            color: '#ffffff',
                            '&:hover': {
                                backgroundColor: '#616161',
                                boxShadow: 5,
                            },
                        }}
                        startIcon={<RecommendIcon />}
                    >
                        Get Recommendations
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }} className="rack-visualization">
                        <StyledRackContainer>
                            <Box className="rack-units">
                                {[...Array(rackSize)].map((_, index) => (
                                    <div key={index} style={{ position: 'absolute', top: `${index * 20}px`, color: '#fff' }}>
                                        {rackSize - index}U
                                    </div>
                                ))}
                            </Box>
                            <Box className="rack-container">
                                <svg
                                    ref={rackRef}
                                    width={rackWidth}
                                    height={rackHeight}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onMouseMove={handleComponentDrag}
                                    onMouseUp={handleComponentDragEnd}
                                >
                                    {/* Rack outline */}
                                    <rect
                                        x="30"
                                        y="0"
                                        width={rackWidth - 30}
                                        height={rackHeight}
                                        fill="none"
                                        stroke="#666"
                                        strokeWidth="2"
                                    />
                                    {/* Rack units */}
                                    {[...Array(rackSize)].map((_, index) => (
                                        <line
                                            key={index}
                                            x1="30"
                                            y1={index * 20}
                                            x2={rackWidth}
                                            y2={index * 20}
                                            stroke="#666"
                                            strokeWidth="1"
                                            opacity="0.5"
                                        />
                                    ))}

                                    {/* Components */}
                                    {components.map((comp) => (
                                        <RackComponent
                                            key={comp.id}
                                            component={comp}
                                            rackWidth={rackWidth}
                                            onDelete={handleDeleteComponent}
                                            onEdit={handleEditComponent}
                                            onDragStart={(e) => handleComponentDragStart(e, comp)}
                                            isDragging={draggedComponent && draggedComponent.id === comp.id}
                                            componentColors={componentColors}
                                            isHighlighted={highlightedType === comp.type}
                                            sequence={comp.sequence}
                                        />
                                    ))}

                                    {/* Preview of dragged component */}
                                    {draggedComponent && (
                                        <rect
                                            x={30}
                                            y={draggedComponent.y}
                                            width={rackWidth - 40}
                                            height={draggedComponent.units * 20}
                                            fill="#FFD700"
                                            fillOpacity={0.2}
                                            stroke="#FFD700"
                                            strokeWidth={2}
                                            strokeDasharray="5,5"
                                            rx="5"
                                            ry="5"
                                        />
                                    )}

                                    {/* Placement indicator */}
                                    {placementIndicator && (
                                        <rect
                                            x={30}
                                            y={placementIndicator.y}
                                            width={rackWidth - 40}
                                            height={placementIndicator.height}
                                            fill="#FFD700"
                                            fillOpacity={0.2}
                                            stroke="#FFD700"
                                            strokeWidth={2}
                                            strokeDasharray="5,5"
                                            rx="5"
                                            ry="5"
                                        />
                                    )}
                                </svg>
                            </Box>
                        </StyledRackContainer>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>Legend</Typography>
                        {Object.entries(componentColors).map(([type, color]) => {
                            const count = components.filter(comp => comp.type === type).length;
                            return (
                                <Box key={type} sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 0.85,
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: `3px solid ${color}`,
                                    borderRadius: '10px',
                                    padding: '1px',
                                    '&:hover': {
                                        transform: 'scale(1.023)',
                                    },
                                }}
                                     onMouseEnter={() => handleHighlight(type)}
                                     onMouseLeave={() => handleHighlight(null)}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                        <Typography>{type} ({count})</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                width: 30, 
                                                height: 30, 
                                                // border: `1px solid ${color}`,
                                                mr: 1,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <VisibilityIcon fontSize="small" sx={{ color: color }} />
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2 }}>
                        <Typography variant="h6" gutterBottom>Infrastructure Layout</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            <LanguageIcon sx={{ fontSize: 40, mb: 2, color: theme.palette.info.main }} />
                            <Box sx={{ 
                                width: '2px', 
                                height: '20px', 
                                backgroundColor: theme.palette.grey[400]
                            }} />
                            <StyledMdfButton sx={{ mb: 2 }}>MDF</StyledMdfButton>
                            <Box sx={{ 
                                width: '100%', 
                                height: '2px', 
                                backgroundColor: theme.palette.grey[400], 
                                position: 'absolute', 
                                top: '50%', 
                                left: 0,
                                transform: 'translateY(-50%)'
                            }} />
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                width: '100%',
                                mt: 4,
                                overflowX: 'auto',
                                '&::-webkit-scrollbar': {
                                    height: '8px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: theme.palette.grey[300],
                                    borderRadius: '4px',
                                },
                            }}>
                                {numIdfs > 1 && (
                                    <IconButton 
                                        onClick={() => document.getElementById('idf-container').scrollLeft -= 100}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <ChevronLeftIcon />
                                    </IconButton>
                                )}
                                <Box 
                                    id="idf-container"
                                    sx={{ 
                                        display: 'flex', 
                                        overflowX: 'auto',
                                        scrollBehavior: 'smooth',
                                        '&::-webkit-scrollbar': {
                                            display: 'none',
                                        },
                                        justifyContent: numIdfs === 1 ? 'center' : 'flex-start',
                                    }}
                                >
                                    {[...Array(numIdfs)].map((_, index) => (
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', m: 1, flexShrink: 0 }}>
                                            <Box sx={{ 
                                                width: '2px', 
                                                height: '20px', 
                                                backgroundColor: theme.palette.grey[400]
                                            }} />
                                            <Box sx={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: theme.palette.grey[400],
                                                my: 1
                                            }} />
                                            <StyledIdfButton 
                                                onClick={() => setCurrentIdf(index + 1)}
                                                isActive={currentIdf === index + 1}
                                            >
                                                IDF {index + 1}
                                            </StyledIdfButton>
                                            <Typography variant="caption" sx={{ mt: 1 }}>
                                                {(idfData[index + 1]?.devices || []).reduce((sum, device) => sum + device.count, 0)} device(s)
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                {numIdfs > 1 && (
                                    <IconButton 
                                        onClick={() => document.getElementById('idf-container').scrollLeft += 100}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ p: 2, height: '98.2%' }}>
                        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#45a049' } }}
                            onClick={handleSaveWorkspace}
                        >
                            Save Workspace
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#2196F3', '&:hover': { backgroundColor: '#1e88e5' } }}
                            onClick={handleLoadWorkspace}
                        >
                            Load Workspace
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#f57c00' } }}
                            onClick={handleAutoPlacement}
                        >
                            Auto Placement
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#9C27B0', '&:hover': { backgroundColor: '#8e24aa' } }}
                            onClick={handleAutoWiring}
                        >
                            Auto Wiring
                        </Button>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>Configuration Calculations</Typography>
                        <Box sx={{ backgroundColor: '#e0e0e0', p: 2, borderRadius: 2, border: '1px solid #bdbdbd' }}>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000' }}>
                                <strong>Expected Patch Panels:</strong> {Math.ceil(totalDevices / 24)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000' }}>
                                <strong>Expected Switches:</strong> {Math.ceil(totalDevices / 48)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000' }}>
                                <strong>Expected Fiber Patch Panels:</strong> {Math.ceil(totalDevices / 24 * 0.1)} {/* Assuming 10% of connections are fiber */}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#000000' }}>
                                <strong>Expected Cable Managers:</strong> {Math.ceil((Math.ceil(totalDevices / 24) + Math.ceil(totalDevices / 48)) / 2)} {/* One cable manager for every two devices */}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Component Details</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" id="component-name" />
                    {newComponent && (newComponent.type === 'switch' || newComponent.type === 'patch_panel' || newComponent.type === 'fiber_patch_panel') ? (
                        <TextField
                            select
                            label="Capacity/Ports"
                            fullWidth
                            margin="normal"
                            id="component-capacity"
                            defaultValue='24'
                        >
                            {newComponent.type === 'switch' ? (
                                ['8', '24', '48'].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))
                            ) : newComponent.type === 'fiber_patch_panel' ? (
                                ['12', '24'].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))
                            ) : (
                                ['24'].map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>
                    ) : (
                        <TextField label="Capacity/Ports" fullWidth margin="normal" id="component-capacity" />
                    )}
                    <TextField label="Units (U)" type="number" fullWidth margin="normal" id="component-units" />
                    {/*<Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>*/}
                    {/*    {recommendation}*/}
                    {/*</Typography>*/}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                        const name = document.getElementById('component-name').value;
                        const capacityElement = document.getElementById('component-capacity');
                        const capacity = capacityElement.tagName.toLowerCase() === 'div'
                            ? capacityElement.nextSibling.value
                            : capacityElement.value;
                        const units = document.getElementById('component-units').value;
                        handleDialogClose(name, capacity, units);
                    }}>Add</Button>
                </DialogActions>
            </Dialog>
            <ComponentConfigDialog
                open={configDialogOpen}
                onClose={handleConfigDialogClose}
                component={editComponent}
                idfData={idfData}
                currentIdf={currentIdf}
                numIdfs={numIdfs}
                deviceSequence={editComponent ? editComponent.sequence : undefined}
            />
            <IssuesDialog
                open={issuesDialogOpen}
                onClose={() => setIssuesDialogOpen(false)}
                issues={getIssues()}
            />
            <ConnectionWizard
                open={connectionWizardOpen}
                onClose={() => setConnectionWizardOpen(false)}
                components={components}
                currentIdf={currentIdf}
                onConnectionCreate={handleConnectionCreate}
                onConnectionUpdate={handleConnectionUpdate}
                onConnectionDelete={handleConnectionDelete}
                existingConnections={connections}
            />
            <PatchingSchedule connections={connections} components={components} />
            {/* Placeholder for Recommendations Dialog */}
            <Dialog
                open={recommendationsDialogOpen}
                onClose={() => setRecommendationsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Recommendations</DialogTitle>
                <DialogContent>
                    <Typography>TODO:</Typography>
                    <Typography>Recommendations content will go here.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecommendationsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

RackVisualization.propTypes = {
    currentIdf: PropTypes.number.isRequired,
    setCurrentIdf: PropTypes.func.isRequired,
    numIdfs: PropTypes.number.isRequired,
    idfData: PropTypes.object.isRequired,
    interIdfConnections: PropTypes.object.isRequired,
    onUpdateInterIdfConnections: PropTypes.func.isRequired,
    onPortChange: PropTypes.func.isRequired,
};

export default RackVisualization;
