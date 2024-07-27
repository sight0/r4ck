import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ComponentConfigDialog = ({ open, onClose, component }) => {
    const [editedComponent, setEditedComponent] = useState(null);

    useEffect(() => {
        if (component) {
            setEditedComponent({ ...component });
        }
    }, [component]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedComponent(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onClose(editedComponent);
    };

    if (!editedComponent) return null;

    return (
        <Dialog open={open} onClose={() => onClose(null)}>
            <DialogTitle>Edit Component: {editedComponent.name}</DialogTitle>
            <DialogContent>
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
                        <MenuItem value="patch_panel">Patch Panel</MenuItem>
                        <MenuItem value="firewall">Firewall</MenuItem>
                        <MenuItem value="ups">UPS</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </Select>
                </FormControl>
                {editedComponent.type === 'switch' && (
                    <TextField
                        name="patchPanelConnection"
                        label="Connected Patch Panel"
                        value={editedComponent.patchPanelConnection || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                )}
                {editedComponent.type === 'fiber_switch' && (
                    <TextField
                        name="fiberPatchPanelConnection"
                        label="Connected Fiber Patch Panel"
                        value={editedComponent.fiberPatchPanelConnection || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                )}
                {/* Add more specific configurations for other types as needed */}
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
