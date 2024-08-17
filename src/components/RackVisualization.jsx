import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Box,
    Grid,
    Paper,
    Divider,
    IconButton,
    Badge,
    Tooltip,
    MenuItem,
    Container,
    Menu,
    List, ListItem, ListItemText
} from '@mui/material';
import { calculateInterIdfConnections } from '../utils/rackUtils';
import IssuesDialog from './IssuesDialog';
import PatchingSchedule from './PatchingSchedule';
import ListAltIcon from '@mui/icons-material/ListAlt';
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import {generateSmartIdentifier} from "../utils/identifierUtils.js";

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

const RackVisualization = ({ 
    currentIdf, 
    setCurrentIdf, 
    numIdfs, 
    idfData, 
    interIdfConnections, 
    onUpdateInterIdfConnections, 
    onPortChange, 
    connectionsPerIdf,
    onAddConnection,
    onUpdateConnection,
    onDeleteConnection,
    rackDesign,
    onSaveRackDesign,
    allComponents,
    setAllComponents
}) => {
    const [componentSequences, setComponentSequences] = useState({});
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [totalDevices, setTotalDevices] = useState(0);
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
    const [patchingScheduleOpen, setPatchingScheduleOpen] = useState(false);
    const rackRef = useRef(null);

    const theme = useTheme();
    const components = useMemo(() => allComponents[currentIdf] || [], [allComponents, currentIdf]);

    useEffect(() => {
        // Calculate total devices for the current IDF
        const devices = idfData[currentIdf]?.devices || [];
        const total = devices.reduce((sum, device) => sum + device.count, 0);
        setTotalDevices(total);
    }, [currentIdf, idfData]);

    const handleAutoPlacement = () => {
        if (components.length > 0) {
            alert("Auto placement is only available when the IDF is empty. Please clear the IDF first.");
            return;
        }

        const fiberPatchPanel = { type: 'fiber_patch_panel', name: 'FPP', capacity: '24', units: 1 };

        const template = [
            { type: 'cable_manager', name: 'Cable Manager 1', capacity: '1', units: 1 },
            { type: 'patch_panel', name: 'PP', capacity: '24', units: 1 },
            { type: 'patch_panel', name: 'PP', capacity: '24', units: 1 },
            { type: 'cable_manager', name: 'Cable Manager 2', capacity: '1', units: 1 },
            { type: 'switch', name: 'C9200-48T', capacity: '48', units: 1 },
        ];

        const templateSize = template.reduce((sum, comp) => sum + comp.units, 0) + fiberPatchPanel.units;
        const requiredTemplates = Math.ceil(totalDevices / 48); // Assuming 48 ports per switch
        const totalRequiredUnits = templateSize + (templateSize - fiberPatchPanel.units) * (requiredTemplates - 1);

        if (totalRequiredUnits > idfData[currentIdf]?.rackSize) {
            alert(`Warning: The current rack size (${idfData[currentIdf]?.rackSize}U) is insufficient for the required components (${totalRequiredUnits}U). Please increase the rack size in the initial setup or reduce the number of devices.`);
            return;
        }

        let yPosition = 0;
        const sequenceTracker = {};
        const newComponents = [];

        // Add fiber patch panel at the top
        const fiberComponent = createComponent(fiberPatchPanel, yPosition, sequenceTracker);
        newComponents.push(fiberComponent);
        yPosition += fiberPatchPanel.units * 20;

        for (let i = 0; i < requiredTemplates; i++) {
            template.forEach((comp) => {
                const component = createComponent(comp, yPosition, sequenceTracker);
                newComponents.push(component);
                yPosition += comp.units * 20;
            });
        }

        setAllComponents(prevAll => ({
            ...prevAll,
            [currentIdf]: newComponents
        }));

        // Update component sequences after adding all components
        setComponentSequences(prevSequences => {
            return { ...prevSequences, ...sequenceTracker };
        });
    };

    const createComponent = (comp, yPosition, sequenceTracker) => {
        if (!sequenceTracker[comp.type]) {
            sequenceTracker[comp.type] = 0;
        }
        sequenceTracker[comp.type]++;
        const sequence = sequenceTracker[comp.type];
        
        return {
            ...comp,
            id: Date.now() + Math.random(),
            x: 30,
            y: yPosition,
            sequence: sequence,
            name: `${comp.name}${sequence}`,
            ports: Array.from({length: parseInt(comp.capacity)}, (_, i) => ({
                label: `Port ${i + 1}`,
                cableSource: '',
                connectedTo: '',
                type: comp.type === 'fiber_patch_panel' ? 'fiber' : 'copper',
                identifier: generateSmartIdentifier(comp.type, currentIdf, sequence, i + 1)
            }))
        };
    };

    const handleAutoWiring = () => {
        let patchPanels = components.filter(c => c.type === 'patch_panel')
            .sort((a, b) => b.ports.length - a.ports.length);
        let switches = components.filter(c => c.type === 'switch')
            .sort((a, b) => b.ports.length - a.ports.length);

        if (patchPanels.length === 0 || switches.length === 0) {
            alert('Auto wiring requires at least one patch panel and one switch.');
            return;
        }

        let newConnections = [];
        let currentPatchPanelIndex = 0;

        switches.forEach(switchComponent => {
            let remainingSwitchPorts = switchComponent.ports.length;
            
            while (remainingSwitchPorts > 0 && currentPatchPanelIndex < patchPanels.length) {
                let currentPatchPanel = patchPanels[currentPatchPanelIndex];
                let portsToConnect = Math.min(remainingSwitchPorts, currentPatchPanel.ports.length);

                for (let i = 0; i < portsToConnect; i++) {
                    const newConnection = {
                        id: Date.now() + Math.random(),
                        deviceA: {
                            componentId: currentPatchPanel.id,
                            port: currentPatchPanel.ports[i].label,
                            identifier: currentPatchPanel.ports[i].identifier,
                            deviceType: 'patch_panel',
                            deviceSequence: currentPatchPanel.sequence
                        },
                        deviceB: {
                            componentId: switchComponent.id,
                            port: switchComponent.ports[switchComponent.ports.length - remainingSwitchPorts + i].label,
                            identifier: switchComponent.ports[switchComponent.ports.length - remainingSwitchPorts + i].identifier,
                            deviceType: 'switch',
                            deviceSequence: switchComponent.sequence
                        },
                        idf: currentIdf,
                        type: 'copper',
                        speed: '10Gbps',
                        notes: 'Auto-generated connection'
                    };
                    newConnections.push(newConnection);
                }

                remainingSwitchPorts -= portsToConnect;
                currentPatchPanelIndex++;
            }
        });

        newConnections.forEach(connection => {
            onAddConnection(connection);
        });
    };

    const handleAutoPortWiring = () => {
        // Initialize ports for patch panels to satisfy device requirements
        const patchPanels = components.filter(c => c.type === 'patch_panel');
        const deviceRequirements = idfData[currentIdf]?.devices || [];

        if (patchPanels.length === 0) {
            alert('Auto port wiring requires at least one patch panel.');
            return;
        }

        let totalRequiredPorts = deviceRequirements.reduce((sum, device) => sum + device.count, 0);
        let availablePorts = patchPanels.reduce((sum, panel) => sum + panel.ports.length, 0);

        if (availablePorts < totalRequiredPorts) {
            alert(`Not enough patch panel ports (${availablePorts}) to satisfy device requirements (${totalRequiredPorts}).`);
            return;
        }

        let updatedComponents = [...components];
        let portIndex = 0;

        deviceRequirements.forEach(requirement => {
            for (let i = 0; i < requirement.count; i++) {
                while (portIndex < patchPanels.length * patchPanels[0].ports.length) {
                    const panelIndex = Math.floor(portIndex / patchPanels[0].ports.length);
                    const portIndexInPanel = portIndex % patchPanels[0].ports.length;
                    const panelComponent = updatedComponents.find(c => c.id ===
                        patchPanels[panelIndex].id);

                    if (panelComponent && !panelComponent.ports[portIndexInPanel].cableSource)
                    {
                        panelComponent.ports[portIndexInPanel].cableSource = requirement.type
                        panelComponent.ports[portIndexInPanel].identifier =
                            generateSmartIdentifier(
                                requirement.type,
                                currentIdf,
                                panelComponent.sequence,
                                portIndexInPanel + 1
                            );
                        break;
                    }
                    portIndex++;
                }
            }
        });

        setAllComponents(prevAll => ({
            ...prevAll,
            [currentIdf]: updatedComponents
        }));

        alert('Auto port wiring completed successfully.');
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
        onAddConnection(newConnection);
        setAllComponents(prevAll => {
            const updatedComponents = prevAll[currentIdf].map(comp => {
                if (comp.id === newConnection.deviceA.componentId || comp.id === newConnection.deviceB.componentId) {
                    return {
                        ...comp,
                        ports: comp.ports.map(port => {
                            if (
                                (comp.id === newConnection.deviceA.componentId && port.label === newConnection.deviceA.port) ||
                                (comp.id === newConnection.deviceB.componentId && port.label === newConnection.deviceB.port)
                            ) {
                                return {
                                    ...port,
                                    connectedTo: comp.id === newConnection.deviceA.componentId ? newConnection.deviceB.componentId : newConnection.deviceA.componentId,
                                    connectedPort: comp.id === newConnection.deviceA.componentId ? newConnection.deviceB.port : newConnection.deviceA.port
                                };
                            }
                            return port;
                        })
                    };
                }
                return comp;
            });
            return {
                ...prevAll,
                [currentIdf]: updatedComponents
            };
        });
    };

    const handleConnectionDelete = (connectionId) => {
        onDeleteConnection(connectionId);
        setAllComponents(prevAll => {
            const connectionToDelete = connectionsPerIdf[currentIdf].find(conn => conn.id === connectionId);
            if (connectionToDelete) {
                const updatedComponents = prevAll[currentIdf].map(device => {
                    if (device.id === connectionToDelete.deviceA.componentId || device.id === connectionToDelete.deviceB.componentId) {
                        return {
                            ...device,
                            ports: device.ports.map(port => 
                                (port.label === connectionToDelete.deviceA.port && device.id === connectionToDelete.deviceA.componentId) ||
                                (port.label === connectionToDelete.deviceB.port && device.id === connectionToDelete.deviceB.componentId)
                                    ? { ...port, connectedTo: '', connectedPort: '', connectionType: '', connectedDeviceType: '' }
                                    : port
                            )
                        };
                    }
                    return device;
                });
                return {
                    ...prevAll,
                    [currentIdf]: updatedComponents
                };
            }
            return prevAll;
        });
    };
    
    const rackSize = idfData[currentIdf]?.rackSize || 42; // Use the specified rack size or default to 42U
    const rackHeight = rackSize * 20; // Each U is 20px tall
    const rackWidth = 298; // Adjust width for smaller racks
    const accentColor = theme.palette.secondary.main;

    const handleGetRecommendations = () => {
        // This function would analyze the current setup and requirements
        // and generate recommendations for switch models, etc.
        setRecommendationsDialogOpen(true);
    };

    const handleClearIdf = () => {
        if (confirm("Are you sure you want to clear this IDF? This action cannot be undone."))
        {
            // Clear all components
            setAllComponents(prevAll => {
                const updatedComponents = { ...prevAll };
                delete updatedComponents[currentIdf];
                return updatedComponents;
            });

            // Clear all connections for this IDF
            onDeleteConnection(currentIdf);

            // Recalculate inter-IDF connections
            const newInterIdfConnections = calculateInterIdfConnections([], currentIdf);
            onUpdateInterIdfConnections({
                ...interIdfConnections,
                [currentIdf]: newInterIdfConnections
            });
        }
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
            
            // Initialize ports for all components
            const portCount = parseInt(capacity);
            newComp.ports = Array.from({ length: portCount }, (_, i) => ({
                label: `Port ${i + 1}`,
                cableSource: '',
                connectedTo: '',
                type: newComp.type === 'fiber_patch_panel' ? 'fiber' : 'copper',
                identifier: generateSmartIdentifier(newComp.type, currentIdf, sequence, i + 1)
            }));
            
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
            // setConnections(prevConnections =>
            //     prevConnections.filter(conn =>
            //         conn.deviceA.componentId !== id && conn.deviceB.componentId !== id
            //     )
            // );

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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
                    <Paper elevation={3} sx={{ p: 2, mb: 2, backgroundColor: theme.palette.background.paper }}>
                        <Typography variant="h6" gutterBottom>Current IDF Requirements</Typography>
                        <Grid container spacing={2}>
                            {['end_user_device', 'access_point', 'ip_phone'].map((deviceType, index) => {
                                const device = idfData[currentIdf]?.devices.find(d => d.type === deviceType);
                                return (
                                    <Grid item xs={4} key={index}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center', 
                                            p: 1, 
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            backgroundColor: theme.palette.background.default
                                        }}>
                                            <Typography variant="subtitle2">{deviceType.replace(/_/g, ' ').toUpperCase()}</Typography>
                                            <Typography variant="h4" color="primary">{device ? device.count : 0}</Typography>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
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
                            startIcon={<ListAltIcon />}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                fontWeight: 'bold',
                                backgroundColor: '#f8bf05',
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 5,
                                },
                            }}
                            onClick={() => setPatchingScheduleOpen(true)}
                        >
                            View Patching Schedule
                        </Button>
                    </Box>
                    {/*<Button*/}
                    {/*    variant="contained"*/}
                    {/*    onClick={handleGetRecommendations}*/}
                    {/*    sx={{*/}
                    {/*        flex: 1,*/}
                    {/*        py: 1.5,*/}
                    {/*        fontWeight: 'bold',*/}
                    {/*        boxShadow: 3,*/}
                    {/*        backgroundColor: '#424242',*/}
                    {/*        color: '#ffffff',*/}
                    {/*        '&:hover': {*/}
                    {/*            backgroundColor: '#616161',*/}
                    {/*            boxShadow: 5,*/}
                    {/*        },*/}
                    {/*    }}*/}
                    {/*    startIcon={<RecommendIcon />}*/}
                    {/*>*/}
                    {/*    Get Recommendations*/}
                    {/*</Button>*/}
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
                        <Typography variant="h6" gutterBottom>AUTO Panel</Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Note: This panel's functionality is most accurate when the initial setup form is filled out correctly.
                        </Typography>
                        <Button
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#FF9800', '&:hover': { backgroundColor: '#f57c00' } }}
                            onClick={handleAutoPlacement}
                            disabled={components.length > 0}
                        >
                            Auto Component Placement
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mb: 2, backgroundColor: '#9C27B0', '&:hover': { backgroundColor: '#8e24aa' } }}
                            onClick={handleAutoPortWiring}
                        >
                            Auto Port Wiring (Patch Panel Setup)
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#34c6ea', '&:hover': { backgroundColor: '#8e24aa' } }}
                            onClick={handleAutoWiring}
                        >
                            Auto Component Wiring
                        </Button>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            sx={{ mb: 2, backgroundColor: '#d1b4b4', '&:hover': { backgroundColor: '#45a049' } }}
                            onClick={handleGetRecommendations}
                            disabled
                        >
                            Get AI Recommendations (Disabled)
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ mb: 2, backgroundColor: '#e95849', '&:hover': { backgroundColor: '#d32f2f' } }}
                            onClick={handleClearIdf}
                        >
                            Clear IDF
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                            Note: Auto placement and wiring functions work best when the IDF is empty. Clear the IDF before using these features for optimal results.
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>Configuration Calculations</Typography>
                        <Box sx={{ backgroundColor: '#3c3b3b', p: 2, borderRadius: 2, border: '1px solid #bdbdbd' }}>
                            <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                                These calculations are based on the total number of devices specified in the initial setup.
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000', backgroundColor: '#dcdcdc', padding: 1, borderRadius: 5, display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ paddingLeft: '10px' }}>Expected Patch Panels:</strong>
                                <span style={{ paddingRight: '30px' }}>{Math.ceil(totalDevices / 24)}</span>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000', backgroundColor: '#dcdcdc', padding: 1, borderRadius: 5, display: 'flex', justifyContent: 'space-between'  }}>
                                <strong style={{ paddingLeft: '10px' }}>Expected 48-port Switches:</strong>
                                <span style={{ paddingRight: '30px' }}>{Math.ceil(totalDevices / 48)}</span>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, color: '#000000', backgroundColor: '#dcdcdc', padding: 1, borderRadius: 5, display: 'flex', justifyContent: 'space-between'  }}>
                                <strong style={{ paddingLeft: '10px' }}>Expected Fiber Patch Panels:</strong>
                                <span style={{ paddingRight: '30px' }}>{1}</span>
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#000000', backgroundColor: '#dcdcdc', padding: 1, borderRadius: 5, display: 'flex', justifyContent: 'space-between'  }}>
                                <strong style={{ paddingLeft: '10px' }}>Expected Cable Managers:</strong>
                                <span style={{ paddingRight: '30px' }}>{Math.ceil(totalDevices / 24) + 1}</span>
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                                Explanation: Patch panels and switches are calculated based on the number of devices, 
                                assuming 24 ports per patch panel and 48 ports per switch. One fiber patch panel is 
                                included for uplink connections. Cable managers are added to organize cabling between components.
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
                onConnectionDelete={handleConnectionDelete}
                existingConnections={connectionsPerIdf[currentIdf] || []}
            />
            <Dialog
                open={patchingScheduleOpen}
                onClose={() => setPatchingScheduleOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Patching Schedule</DialogTitle>
                <DialogContent>
                    <PatchingSchedule 
                        connections={connectionsPerIdf[currentIdf] || []} 
                        components={components} 
                        currentIdf={currentIdf}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPatchingScheduleOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
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
    connectionsPerIdf: PropTypes.object.isRequired,
    onAddConnection: PropTypes.func.isRequired,
    onUpdateConnection: PropTypes.func.isRequired,
    onDeleteConnection: PropTypes.func.isRequired,
    rackDesign: PropTypes.array.isRequired,
    onSaveRackDesign: PropTypes.func.isRequired,
    allComponents: PropTypes.object.isRequired,
    setAllComponents: PropTypes.func.isRequired,
};

export default RackVisualization;
