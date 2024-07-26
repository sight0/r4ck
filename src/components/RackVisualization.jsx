import PropTypes from 'prop-types';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Box } from '@mui/material';

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
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const component = JSON.parse(e.dataTransfer.getData('component'));

        // Snap to grid
        const snappedY = Math.round(y / 20) * 20;

        setNewComponent({
            ...component,
            x: 10, // Always align to left
            y: snappedY,
            id: components.length,
        });
        setDialogOpen(true);
    }, [components]);

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

    return (
        <Box className="rack-visualization" sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            p: 3, 
            background: 'linear-gradient(145deg, #f0f0f0, #e6e6e6)',
            borderRadius: '15px',
            boxShadow: '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
        }}>
            <Typography variant="h5" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                IDF {currentIdf} Rack Design
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: '#666', fontStyle: 'italic' }}>
                {recommendation}
            </Typography>
            <Box sx={{ 
                position: 'relative', 
                width: rackWidth, 
                height: rackHeight,
                border: '2px solid #333',
                borderRadius: '5px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
                },
            }}>
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
                        <g key={comp.id} transform={`translate(${comp.x}, ${comp.y})`}>
                            <rect
                                width={rackWidth - 20}
                                height={comp.units * 20}
                                fill={comp.type === 'rack' ? '#8d6e63' : '#42a5f5'}
                                stroke={comp.type === 'rack' ? '#5d4037' : '#1e88e5'}
                                rx="5"
                                ry="5"
                            />
                            <text x={(rackWidth - 20) / 2} y={(comp.units * 20) / 2} textAnchor="middle" fill="white" fontSize="12" dy=".3em">
                                {comp.name} ({comp.capacity})
                            </text>
                        </g>
                    ))}
                </svg>
            </Box>
            <Button 
                onClick={handleNextIdf} 
                disabled={currentIdf >= totalIdfs}
                sx={{ 
                    mt: 2, 
                    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                    border: 0,
                    borderRadius: 3,
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                    color: 'white',
                    height: 48,
                    padding: '0 30px',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #FE8B8B 30%, #FFAE73 90%)',
                    },
                }}
            >
                Next IDF
            </Button>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Component Details</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="normal" />
                    <TextField label="Capacity/Ports" fullWidth margin="normal" />
                    <TextField label="Units (U)" type="number" fullWidth margin="normal" />
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
