import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, Box } from '@mui/material';

const ComponentConfigDialog = ({ open, onClose, component }) => {
    const [editedComponent, setEditedComponent] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (component) {
            setEditedComponent({ 
                ...component, 
                frontPorts: component.frontPorts || [],
                backPorts: component.backPorts || []
            });
        }
    }, [component]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedComponent(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onClose(editedComponent);
    };

    const handlePortChange = (side, index, field, value) => {
        setEditedComponent(prev => {
            const ports = [...prev[`${side}Ports`]];
            ports[index] = { ...ports[index], [field]: value };
            return { ...prev, [`${side}Ports`]: ports };
        });
    };

    const renderPorts = (side) => {
        const ports = editedComponent[`${side}Ports`];
        alert(side);
        return (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
                {ports.map((port, index) => (
                    <Box key={index} sx={{ border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
                        <TextField
                            label={`Port ${index + 1}`}
                            value={port.label || ''}
                            onChange={(e) => handlePortChange(side, index, 'label', e.target.value)}
                            fullWidth
                            margin="dense"
                        />
                        <TextField
                            label="Note"
                            value={port.note || ''}
                            onChange={(e) => handlePortChange(side, index, 'note', e.target.value)}
                            fullWidth
                            margin="dense"
                        />
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
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab label="General" />
                    <Tab label="Front Ports" />
                    <Tab label="Back Ports" />
                </Tabs>
                {tabValue === 0 && (
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
                )}
                {tabValue === 1 && renderPorts('front')}
                {tabValue === 2 && renderPorts('back')}
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
};

export default ComponentConfigDialog;
