import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import RackComponent from './RackComponent';
import ComponentConfigDialog from './ComponentConfigDialog';

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

const RackVisualization = ({ currentIdf, setCurrentIdf, numIdfs, idfData }) => {
    const theme = useTheme();
    const [components, setComponents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);
    const [editComponent, setEditComponent] = useState(null);
    const [recommendation, setRecommendation] = useState('');
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [placementIndicator, setPlacementIndicator] = useState(null);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [exhaustedPorts, setExhaustedPorts] = useState(0);
    const rackRef = useRef(null);

    const rackHeight = 42 * 20; // 42U rack height
    const rackWidth = 300; // Increased width for better visibility
    const accentColor = theme.palette.secondary.main;

    useEffect(() => {
        // Calculate exhausted ports based on the number of patch panel components
        const patchPanelPorts = components.filter(c => c.type === 'patchPanel').reduce((total, panel) => total + parseInt(panel.capacity), 0);
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
            height: 40, // Default height of 2U
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
                setComponents(prevComponents => [...prevComponents, newComp]);
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

    const handleNextIdf = () => {
        if (currentIdf < numIdfs) {
            setCurrentIdf(currentIdf + 1);
            setComponents([]);
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
            setComponents(prevComponents => 
                prevComponents.map(comp => 
                    comp.id === draggedComponent.id ? draggedComponent : comp
                )
            );
        } else {
            // If there's an overlap, revert to the original position
            setComponents(prevComponents => prevComponents);
        }

        setDraggedComponent(null);
    }, [draggedComponent, components]);

    const handleDeleteComponent = (id) => {
        setComponents(prevComponents => prevComponents.filter(comp => comp.id !== id));
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
                setComponents(prevComponents =>
                    prevComponents.map(comp =>
                        comp.id === updatedComponent.id ? updatedComponent : comp
                    )
                );
            } else {
                alert("The updated component overlaps with existing components. Please adjust the size or position.");
            }
        }
        setConfigDialogOpen(false);
        setEditComponent(null);
    };

    return (
        <Box className="rack-visualization-container">
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                IDF <span style={{ color: accentColor }}>{currentIdf}</span> Rack Design
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Exhausted Ports: {exhaustedPorts} / {idfData[currentIdf]?.ports || 0}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }} className="rack-visualization">
                <StyledRackContainer>
                    <Box className="rack-units">
                        {[...Array(42)].map((_, index) => (
                            <div key={index} style={{ position: 'absolute', top: `${index * 20}px`, color: '#fff' }}>
                                {42 - index}U
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
                            {[...Array(42)].map((_, index) => (
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
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                <Button 
                    onClick={handleNextIdf} 
                    className="next-idf-button" 
                    variant="contained"
                    sx={{
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${accentColor} 90%)`,
                        boxShadow: `0 3px 5px 2px ${accentColor}66`,
                    }}
                >
                    Next IDF
                </Button>
            </Box>
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
            />
        </Box>
    );
}

RackVisualization.propTypes = {
    currentIdf: PropTypes.number.isRequired,
    setCurrentIdf: PropTypes.func.isRequired,
    numIdfs: PropTypes.number.isRequired,
    idfData: PropTypes.object.isRequired,
};

export default RackVisualization;
