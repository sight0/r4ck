import React, { useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const RackVisualization = ({ currentIdf, setCurrentIdf, totalIdfs }) => {
    const [components, setComponents] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newComponent, setNewComponent] = useState(null);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const component = JSON.parse(e.dataTransfer.getData('component'));

        setNewComponent({
            ...component,
            x: point.x,
            y: point.y,
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
        <div className="rack-visualization">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{ width: '100%', height: '100%' }}
            >
                <Stage width={window.innerWidth * 0.8} height={window.innerHeight}>
                    <Layer>
                        {components.map((comp) => (
                            <React.Fragment key={comp.id}>
                                <Rect
                                    x={comp.x}
                                    y={comp.y}
                                    width={100}
                                    height={comp.units * 20}
                                    fill={comp.type === 'rack' ? '#8d6e63' : '#42a5f5'}
                                    stroke={comp.type === 'rack' ? '#5d4037' : '#1e88e5'}
                                    strokeWidth={2}
                                    draggable
                                />
                                <Text
                                    x={comp.x}
                                    y={comp.y + 5}
                                    width={100}
                                    text={`${comp.name}\n${comp.capacity}`}
                                    fontSize={12}
                                    fill="white"
                                    align="center"
                                />
                            </React.Fragment>
                        ))}
                    </Layer>
                </Stage>
            </div>
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
