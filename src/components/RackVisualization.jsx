import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';
import RackComponent from './RackComponent';

const RackVisualization = ({ currentIdf, setCurrentIdf, totalIdfs, idfUsers }) => {
    const [components, setComponents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);
    const [recommendation, setRecommendation] = useState('');
    const [draggedComponent, setDraggedComponent] = useState(null);
    const rackRef = useRef(null);

    const rackHeight = 42 * 20; // 42U rack height
    const rackWidth = 300;

    useEffect(() => {
        // TODO: Implement actual recommendation logic
        setRecommendation('Recommendation: Add a 48-port switch for optimal performance.');
    }, [currentIdf, idfUsers]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const component = JSON.parse(e.dataTransfer.getData('component'));

        // Snap to grid
        const snappedY = Math.floor(y / 20) * 20;

        setNewComponent({
            ...component,
            x: 10, // Always align to left
            y: snappedY,
            id: Date.now(),
        });
        setDialogOpen(true);
    }, []);

    const handleDialogClose = (name, capacity, units) => {
        if (name && capacity && units) {
            const newComp = {
                ...newComponent,
                name,
                capacity,
                units: parseInt(units),
            };
            
            // Check for overlap with existing components
            const overlap = components.some(comp => 
                (newComp.y < comp.y + comp.units * 20) && 
                (newComp.y + newComp.units * 20 > comp.y)
            );

            if (!overlap) {
                setComponents(prevComponents => [...prevComponents, newComp]);
            } else {
                alert("This position overlaps with an existing component. Please choose a different position.");
            }
        }
        setDialogOpen(false);
        setNewComponent(null);
    };

    const handleNextIdf = () => {
        if (currentIdf < totalIdfs) {
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
        }

        setDraggedComponent(null);
    }, [draggedComponent, components]);

    const handleDeleteComponent = (id) => {
        setComponents(prevComponents => prevComponents.filter(comp => comp.id !== id));
    };

    return (
        <Box className="rack-visualization">
            <Typography variant="h5" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                IDF {currentIdf} Rack Design
            </Typography>
            <Box className="rack-container">
                <svg
                    ref={rackRef}
                    width={rackWidth}
                    height={rackHeight}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onMouseMove={handleComponentDrag}
                    onMouseUp={handleComponentDragEnd}
                >
                    {/* Rack units */}
                    {[...Array(42)].map((_, index) => (
                        <g key={index} transform={`translate(0, ${index * 20})`}>
                            <line x1="0" y1="0" x2={rackWidth} y2="0" stroke="#ddd" strokeWidth="1" />
                            <text x="5" y="15" fill="#999" fontSize="10">
                                {42 - index}U
                            </text>
                        </g>
                    ))}

                    {/* Components */}
                    {components.map((comp) => (
                        <RackComponent
                            key={comp.id}
                            component={comp}
                            rackWidth={rackWidth}
                            onDelete={handleDeleteComponent}
                            onDragStart={(e) => handleComponentDragStart(e, comp)}
                            isDragging={draggedComponent && draggedComponent.id === comp.id}
                        />
                    ))}

                    {/* Preview of dragged component */}
                    {draggedComponent && (
                        <rect
                            x={10}
                            y={draggedComponent.y}
                            width={rackWidth - 20}
                            height={draggedComponent.units * 20}
                            fill="rgba(66, 165, 245, 0.5)"
                            stroke="#1e88e5"
                            strokeDasharray="5,5"
                            rx="5"
                            ry="5"
                        />
                    )}
                </svg>
            </Box>
            <Button onClick={handleNextIdf} className="next-idf-button">
                Next IDF
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Component Details</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" id="component-name" />
                    <TextField label="Capacity/Ports" fullWidth margin="normal" id="component-capacity" />
                    <TextField label="Units (U)" type="number" fullWidth margin="normal" id="component-units" />
                    <Typography variant="body2" className="recommendation">
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
        </Box>
    );
}

RackVisualization.propTypes = {
    currentIdf: PropTypes.number.isRequired,
    setCurrentIdf: PropTypes.func.isRequired,
    totalIdfs: PropTypes.number.isRequired,
    idfUsers: PropTypes.object.isRequired,
};

export default RackVisualization;
