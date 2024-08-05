import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import PortSetupDialog from './PortSetupDialog';

const ComponentConfigDialog = ({ open, onClose, component, numIdfs, idfData, currentIdf, deviceSequence }) => {
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
                                <MenuItem value="router">Router</MenuItem>
                                <MenuItem value="switch">Switch</MenuItem>
                                <MenuItem value="fiber_switch">Fiber Switch</MenuItem>
                                <MenuItem value="patch_panel">Patch Panel</MenuItem>
                                <MenuItem value="firewall">Firewall</MenuItem>
                                <MenuItem value="server">Server</MenuItem>
                                <MenuItem value="ups">UPS</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        {editedComponent.type === 'patch_panel' && (
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
            {editedComponent.type === 'patch_panel' && (
                <PortSetupDialog
                    open={showPortSetup}
                    onClose={() => setShowPortSetup(false)}
                    ports={editedComponent.ports}
                    numIdfs={numIdfs}
                    idf={currentIdf}
                    onPortChange={handlePortChange}
                    component={editedComponent}
                    deviceSequence={deviceSequence}
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
    deviceSequence: PropTypes.number.isRequired,
};

export default ComponentConfigDialog;
