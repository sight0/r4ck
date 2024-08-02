import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

const ComponentConfigDialog = ({ open, onClose, component, idfs }) => {
    const [editedComponent, setEditedComponent] = useState(null);

    useEffect(() => {
        if (component) {
            const initializePorts = (count) => Array.from({ length: count }, (_, i) => ({ label: `Port ${i + 1}`, cableSource: '' }));
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
                const initializePorts = (count) => Array.from({ length: count }, (_, i) => ({ label: `Port ${i + 1}`, cableSource: '' }));
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
                                {idfs.map((idf) => (
                                    <MenuItem key={idf} value={`IDF_${idf}`}>{`IDF ${idf}`}</MenuItem>
                                ))}
                                <MenuItem value="MDF">MDF</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
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
                </Box>
                {renderPorts()}
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
    idfs: PropTypes.arrayOf(PropTypes.string).isRequired,
    mdfs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ComponentConfigDialog;
