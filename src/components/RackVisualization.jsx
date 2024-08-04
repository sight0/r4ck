import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { calculateInterIdfConnections } from '../utils/rackUtils';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box, Grid, Paper, Divider, IconButton, Badge, Tooltip } from '@mui/material';
import IssuesDialog from './IssuesDialog';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RackComponent from './RackComponent';
import ComponentConfigDialog from './ComponentConfigDialog';
import IssuesPanel from './IssuesPanel';
import { components } from './Sidebar';

const componentColors = Object.fromEntries(components.map(comp => [comp.type, comp.color]));

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
    const rackRef = useRef(null);
    
    const rackSize = idfData[currentIdf]?.rackSize || 42; // Use the specified rack size or default to 42U
    const rackHeight = rackSize * 20; // Each U is 20px tall
    // const rackWidth = rackSize <= 24 ? 200 : 300; // Adjust width for smaller racks
    const rackWidth = 298; // Adjust width for smaller racks
    const accentColor = theme.palette.secondary.main;

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

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const componentData = e.dataTransfer.getData('text/plain');
        const component = JSON.parse(componentData);

        // Snap to grid
        const snappedY = Math.floor(y / 20) * 20;

        setNewComponent({
            ...component,
            x: 30, // Adjusted to accommodate rack unit labels
            y: snappedY,
            id: Date.now(),
        });
        setDialogOpen(true);
        setPlacementIndicator(null);
    }, []);

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
            const newComp = {
                ...newComponent,
                name,
                capacity,
                units: parseInt(units),
            };
            
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
                setAllComponents(prevAll => ({
                    ...prevAll,
                    [currentIdf]: [...(prevAll[currentIdf] || []), newComp]
                }));
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
        setAllComponents(prevAll => ({
            ...prevAll,
            [currentIdf]: prevAll[currentIdf].filter(comp => comp.id !== id)
        }));
    };

    const handleEditComponent = (component) => {
        setEditComponent(component);
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
                        comp.id === updatedComponent.id ? updatedComponent : comp
                    );
                    
                    // Recalculate inter-IDF connections for all IDFs
                    const newInterIdfConnections = {};
                    Object.keys(prevAll).forEach(idf => {
                        newInterIdfConnections[idf] = calculateInterIdfConnections(
                            idf === currentIdf.toString() ? newComponents : prevAll[idf],
                            parseInt(idf)
                        )[idf];
                    });
                    
                    onUpdateInterIdfConnections(newInterIdfConnections);
                    
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
            const allocatedPorts = patchPanelPorts.filter(port => port.cableSource === type).length;

            issues.push({
                message: `Allocate patch panel ports for ${type}: This IDF requires ${count} dedicated patch panel port(s) for ${type}.`,
                isSatisfied: allocatedPorts >= count,
                severity: 'high',
                solutionHint: allocatedPorts >= count
                    ? `All required ports are allocated for ${type}.`
                    : `Configure ${count - allocatedPorts} more port(s) for ${type}.`
            });
        });

        // Check for outgoing connections to other IDFs or MDF
        Object.entries(interIdfConnections[currentIdf] || {}).forEach(([targetIdf, connectionCount]) => {
            if (targetIdf !== `IDF_${currentIdf}` && targetIdf !== 'MDF') {
                const allocatedPorts = patchPanelPorts.filter(port => port.cableSource === targetIdf).length;

                if (allocatedPorts < connectionCount) {
                    issues.push({
                        message: `Allocate patch panel ports for outgoing connections to ${targetIdf}: This IDF requires ${connectionCount} dedicated patch panel port(s) to send connections to ${targetIdf}.`,
                        isSatisfied: false,
                        severity: 'high',
                        solutionHint: `Configure ${connectionCount - allocatedPorts} more port(s) for sending connections to ${targetIdf}.`
                    });
                }
            }
        });

        // Check for MDF connections
        const mdfConnections = interIdfConnections[currentIdf]?.MDF || 0;
        if (mdfConnections > 0) {
            const allocatedMdfPorts = patchPanelPorts.filter(port => port.cableSource === 'MDF').length;

            if (allocatedMdfPorts < mdfConnections) {
                issues.push({
                    message: `Allocate patch panel ports for outgoing connections to MDF: This IDF requires ${mdfConnections} dedicated patch panel port(s) to send connections to MDF.`,
                    isSatisfied: false,
                    severity: 'high',
                    solutionHint: `Configure ${mdfConnections - allocatedMdfPorts} more port(s) for sending connections to MDF.`
                });
            }
        }

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
                <Button
                    variant="contained"
                    color={getIssues().some(issue => !issue.isSatisfied) ? "error" : "primary"}
                    size="large"
                    onClick={() => setIssuesDialogOpen(true)}
                    sx={{
                        width: '100%',
                        py: 1.5,
                        fontWeight: 'bold',
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 5,
                        },
                    }}
                    startIcon={getIssues().some(issue => !issue.isSatisfied) && <ErrorOutlineIcon />}
                >
                    {getIssues().some(issue => !issue.isSatisfied) ? "View Issues and Requirements" : "All Requirements Satisfied"}
                </Button>
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
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
                                <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: 20, height: 20, backgroundColor: color, mr: 1 }} />
                                        <Typography>{type} ({count})</Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onMouseEnter={() => handleHighlight(type)}
                                        onMouseLeave={() => handleHighlight(null)}
                                    >
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
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
            </Grid>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Component Details</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" id="component-name" />
                    <TextField label="Capacity/Ports" fullWidth margin="normal" id="component-capacity" />
                    <TextField label="Units (U)" type="number" fullWidth margin="normal" id="component-units" />
                    <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                        {recommendation}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                        const name = document.getElementById('component-name').value;
                        const capacity = document.getElementById('component-capacity').value;
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
            />
            <IssuesDialog
                open={issuesDialogOpen}
                onClose={() => setIssuesDialogOpen(false)}
                issues={getIssues()}
            />
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
