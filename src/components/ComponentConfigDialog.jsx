import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import PortSetupDialog from './PortSetupDialog';
import { generateSmartIdentifier } from '../utils/identifierUtils';

const ComponentConfigDialog = ({ open, onClose, component, numIdfs, idfData, currentIdf, deviceSequence = 0 }) => {
    const [editedComponent, setEditedComponent] = useState(null);
    const [showPortSetup, setShowPortSetup] = useState(false);

    useEffect(() => {
        if (component) {
            const initializePorts = (count, componentType, sequence) => Array.from({ length: count }, (_, i) => {
                const portLabel = `Port ${i + 1}`;
                const identifier = generateSmartIdentifier(componentType, currentIdf, sequence, i + 1);
                return { label: portLabel, cableSource: '', connectedTo: '', identifier };
            });

            setEditedComponent({ 
                ...component, 
                ports: component.ports || initializePorts(component.capacity, component.type, component.sequence || deviceSequence),
                sequence: component.sequence || deviceSequence,
                deviceSequence: component.sequence || deviceSequence
            });
        }
    }, [component, currentIdf, deviceSequence]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedComponent(prev => {
            const updatedComponent = { ...prev, [name]: value };
            if (name === 'capacity' || name === 'type') {
                const newCapacity = name === 'capacity' ? parseInt(value, 10) : prev.capacity;
                const newType = name === 'type' ? value : prev.type;
                const initializePorts = (count) => Array.from({ length: count }, (_, i) => {
                    const portLabel = `Port ${i + 1}`;
                    const identifier = generateSmartIdentifier(newType, currentIdf, updatedComponent.sequence, i + 1);
                    return { 
                        label: portLabel, 
                        cableSource: '', 
                        connectedTo: '', 
                        type: newType === 'fiber_patch_panel' ? 'fiber' : 'copper',
                        identifier 
                    };
                });
                updatedComponent.ports = initializePorts(newCapacity);
            }
            return updatedComponent;
        });
    };

    const handleSave = () => {
        onClose({
            ...editedComponent,
            deviceSequence: editedComponent.sequence // Ensure deviceSequence is set
        });
    };

    const handlePortChange = (index, field, value) => {
        setEditedComponent(prev => {
            const ports = [...prev.ports];
            ports[index] = { ...ports[index], [field]: value };
            
            // Update connectedTo field based on component type and cable source
            if (prev.type === 'patch_panel') {
                if (['end_user_device', 'ip_phone', 'access_point'].includes(value)) {
                    ports[index].connectedTo = value;
                } else {
                    ports[index].connectedTo = '';
                }
            } else if (prev.type === 'fiber_patch_panel') {
                if (value.startsWith('IDF_') || value === 'MDF') {
                    ports[index].connectedTo = value;
                } else {
                    ports[index].connectedTo = '';
                }
            }
            
            return { ...prev, ports: ports };
        });
    };

    if (!editedComponent) return null;

    return (
        <>
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
                        {editedComponent.type === 'switch' || editedComponent.type === 'patch_panel' || editedComponent.type === 'fiber_patch_panel' || editedComponent.type === 'ont' ? (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Capacity/Ports</InputLabel>
                                <Select
                                    name="capacity"
                                    value={editedComponent.capacity}
                                    onChange={handleChange}
                                >
                                    {editedComponent.type === 'switch' ? (
                                        ['8', '24', '48'].map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    ) : editedComponent.type === 'fiber_patch_panel' ? (
                                        ['12', '24'].map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    ) : editedComponent.type === 'ont' ? (
                                        ['1', '2'].map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        ['24'].map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                name="capacity"
                                label="Capacity/Ports"
                                value={editedComponent.capacity}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                        )}
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
                                <MenuItem value="router">Router</MenuItem>
                                <MenuItem value="switch">Switch</MenuItem>
                                <MenuItem value="fiber_switch">Fiber Switch</MenuItem>
                                <MenuItem value="patch_panel">Patch Panel</MenuItem>
                                <MenuItem value="fiber_patch_panel">Fiber Patch Panel</MenuItem>
                                <MenuItem value="firewall">Firewall</MenuItem>
                                <MenuItem value="server">Server</MenuItem>
                                <MenuItem value="ups">UPS</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        {(editedComponent.type === 'patch_panel' || editedComponent.type === 'fiber_patch_panel') && (
                            <Button 
                                onClick={() => setShowPortSetup(true)} 
                                variant="outlined" 
                                sx={{ mt: 2 }}
                            >
                                Configure Ports
                            </Button>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(null)}>Cancel</Button>
                    <Button onClick={handleSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
            {(editedComponent.type === 'patch_panel' || editedComponent.type === 'fiber_patch_panel') && (
                <PortSetupDialog
                    open={showPortSetup}
                    onClose={() => setShowPortSetup(false)}
                    ports={editedComponent.ports}
                    numIdfs={numIdfs}
                    idf={currentIdf}
                    onPortChange={handlePortChange}
                    component={editedComponent}
                />
            )}
        </>
    );
};

ComponentConfigDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    component: PropTypes.object,
    numIdfs: PropTypes.number.isRequired,
    idfData: PropTypes.object.isRequired,
    currentIdf: PropTypes.number.isRequired,
    deviceSequence: PropTypes.number,
};

export default ComponentConfigDialog;
