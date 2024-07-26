import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';
import RackComponent from './RackComponent';

const RackVisualization = ({ currentIdf, setCurrentIdf, totalIdfs, idfUsers }) => {
    const [components, setComponents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);
    const [recommendation, setRecommendation] = useState('');
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
        const snappedY = Math.round(y / 20) * 20;

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
            setComponents(prevComponents => [
                ...prevComponents,
                {
                    ...newComponent,
                    name,
                    capacity,
                    units: parseInt(units),
                }
            ]);
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

    const handleComponentDrop = useCallback((e) => {
        e.preventDefault();
        const componentId = e.dataTransfer.getData('componentId');
        const rect = rackRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const snappedY = Math.round(y / 20) * 20;

        setComponents(prevComponents => 
            prevComponents.map(comp => 
                comp.id.toString() === componentId ? { ...comp, y: snappedY } : comp
            )
        );
    }, []);

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
                            onDragStart={(e) => e.dataTransfer.setData('componentId', comp.id)}
                        />
                    ))}
                </svg>
            </Box>
            <Button onClick={handleNextIdf} className="next-idf-button">
                Next IDF
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Component Details</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" />
                    <TextField label="Capacity/Ports" fullWidth margin="normal" />
                    <TextField label="Units (U)" type="number" fullWidth margin="normal" />
                    <Typography variant="body2" className="recommendation">
                        {recommendation}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleDialogClose('Sample Name', '24 ports', '1')}>Add</Button>
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
