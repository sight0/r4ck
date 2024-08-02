import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';

const ComponentConfigDialog = ({ open, onClose, component, numIdfs, idfData }) => {
    const [editedComponent, setEditedComponent] = useState(null);
    const [showPortSetup, setShowPortSetup] = useState(false);

    useEffect(() => {
        if (component) {
            const initializePorts = (count) => Array.from({ length: count }, (_, i) => ({ label: `Port ${i + 1}`, cableSource: '', connectedTo: '' }));
            setEditedComponent({ 
                ...component, 
                ports: component.ports || initializePorts(component.capacity)
            });
        }
    }, [component]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedComponent(prev => {
            const updatedComponent = { ...prev, [name]: value };
            if (name === 'capacity') {
                const newCapacity = parseInt(value, 10);
                const initializePorts = (count) => Array.from({ length: count }, (_, i) => ({ label: `Port ${i + 1}`, cableSource: '', connectedTo: '' }));
                updatedComponent.ports = initializePorts(newCapacity);
            }
            return updatedComponent;
        });
    };

    const handleSave = () => {
        onClose(editedComponent);
    };

    const handlePortChange = (index, field, value) => {
        setEditedComponent(prev => {
            const ports = [...prev.ports];
            ports[index] = { ...ports[index], [field]: value };
            
            // If connecting to an IDF or MDF, update the connectedTo field
            if (field === 'cableSource' && (value.startsWith('IDF_') || value === 'MDF')) {
                ports[index].connectedTo = value;
            } else if (field === 'cableSource') {
                ports[index].connectedTo = '';
            }
            
            return { ...prev, ports: ports };
        });
    };

    const renderPorts = () => {
        const ports = editedComponent.ports;
        return (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
                {ports.map((port, index) => (
                    <Box key={index} sx={{ border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
                        <TextField
                            label={`Port ${index + 1}`}
                            value={port.label || ''}
                            onChange={(e) => handlePortChange(index, 'label', e.target.value)}
                            fullWidth
                            margin="dense"
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Device</InputLabel>
                            <Select
                                value={port.cableSource || ''}
                                onChange={(e) => handlePortChange(index, 'cableSource', e.target.value)}
                            >
                                <MenuItem value="AP">Access Point</MenuItem>
                                <MenuItem value="IP_PHONE">IP Telephone</MenuItem>
                                {[...Array(numIdfs)].map((_, idx) => (
                                    idx + 1 !== editedComponent.idf && 
                                    <MenuItem key={idx + 1} value={`IDF_${idx + 1}`}>{`IDF ${idx + 1}`}</MenuItem>
                                ))}
                                <MenuItem value="MDF">MDF</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                        {port.connectedTo && (
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Connected to: {port.connectedTo}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        );
    };

    if (!editedComponent) return null;

    return (
        <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Component: {editedComponent.name}</DialogTitle>
            <DialogContent>
                <Box>
                    <TextField
                        name="name"
                        label="Name"
                        value={editedComponent.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="capacity"
                        label="Capacity/Ports"
                        value={editedComponent.capacity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="units"
                        label="Units (U)"
                        type="number"
                        value={editedComponent.units}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Type</InputLabel>
                        <Select
                            name="type"
                            value={editedComponent.type}
                            onChange={handleChange}
                        >
                            <MenuItem value="switch">Switch</MenuItem>
                            <MenuItem value="fiber_switch">Fiber Switch</MenuItem>
                            <MenuItem value="patchPanel">Patch Panel</MenuItem>
                            <MenuItem value="firewall">Firewall</MenuItem>
                            <MenuItem value="ups">UPS</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="rack">Rack</MenuItem>
                        </Select>
                    </FormControl>
                    <Button 
                        onClick={() => setShowPortSetup(!showPortSetup)} 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                    >
                        {showPortSetup ? 'Hide Port Setup' : 'Show Port Setup'}
                    </Button>
                </Box>
                {showPortSetup && renderPorts()}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(null)}>Cancel</Button>
                <Button onClick={handleSave} color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

ComponentConfigDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    component: PropTypes.object,
    numIdfs: PropTypes.number.isRequired,
    idfData: PropTypes.object.isRequired,
};

export default ComponentConfigDialog;
