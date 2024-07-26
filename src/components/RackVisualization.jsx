import PropTypes from 'prop-types';
import { useState, useCallback, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const RackVisualization = ({ currentIdf, setCurrentIdf, totalIdfs, idfUsers }) => {
    const [components, setComponents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);
    const rackRef = useRef(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const rect = rackRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const component = JSON.parse(e.dataTransfer.getData('component'));

        setNewComponent({
            ...component,
            x,
            y,
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

    const rackHeight = 42 * 20; // 42U rack height
    const rackWidth = 200;

    return (
        <div className="rack-visualization">
            <svg
                ref={rackRef}
                width={rackWidth}
                height={rackHeight}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {/* Rack outline */}
                <rect x="0" y="0" width={rackWidth} height={rackHeight} fill="#f0f0f0" stroke="#000" />
                
                {/* Patch panels */}
                {[...Array(Math.ceil(idfUsers[currentIdf] / 24))].map((_, index) => (
                    <g key={index} transform={`translate(0, ${index * 20})`}>
                        <rect x="10" y="0" width={rackWidth - 20} height="20" fill="#42a5f5" stroke="#1e88e5" />
                        <text x={rackWidth / 2} y="15" textAnchor="middle" fill="white" fontSize="12">
                            Patch Panel {index + 1}
                        </text>
                    </g>
                ))}

                {/* Other components */}
                {components.map((comp) => (
                    <g key={comp.id} transform={`translate(${comp.x}, ${comp.y})`}>
                        <rect
                            width={rackWidth - 20}
                            height={comp.units * 20}
                            fill={comp.type === 'rack' ? '#8d6e63' : '#42a5f5'}
                            stroke={comp.type === 'rack' ? '#5d4037' : '#1e88e5'}
                        />
                        <text x={(rackWidth - 20) / 2} y="15" textAnchor="middle" fill="white" fontSize="12">
                            {comp.name} ({comp.capacity})
                        </text>
                    </g>
                ))}
            </svg>
            <Button onClick={handleNextIdf} disabled={currentIdf >= totalIdfs}>
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
        </div>
    );
}

export default RackVisualization;
