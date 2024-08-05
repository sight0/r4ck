import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import { generateSmartIdentifier, isEndUserDeviceType } from '../utils/identifierUtils';

const PortSetupDialog = ({ open, onClose, ports, numIdfs, idf, onPortChange, component, deviceSequence }) => {
    const componentType = component.type;
    const [localPorts, setLocalPorts] = useState(ports);

    useEffect(() => {
        setLocalPorts(ports);
    }, [ports]);

    const handleCableSourceChange = (index, value) => {
        const updatedPorts = [...localPorts];
        updatedPorts[index].cableSource = value;
        updatedPorts[index].identifier = generateSmartIdentifier(
            value,
            idf,
            deviceSequence,
            index + 1
        );
        setLocalPorts(updatedPorts);
        onPortChange(index, 'cableSource', value);
        onPortChange(index, 'identifier', updatedPorts[index].identifier);
    };

    return (
        <Dialog open={open} onClose={() => onClose(localPorts)} maxWidth="lg" fullWidth>
            <DialogTitle>Configure Ports for {componentType}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {localPorts.map((port, index) => (
                        <Box key={index} sx={{ border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
                            <TextField
                                label={`Port ${index + 1}`}
                                value={port.label || ''}
                                onChange={(e) => {
                                    const updatedPorts = [...localPorts];
                                    updatedPorts[index].label = e.target.value;
                                    setLocalPorts(updatedPorts);
                                    onPortChange(index, 'label', e.target.value);
                                }}
                                fullWidth
                                margin="dense"
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Device</InputLabel>
                                <Select
                                    value={port.cableSource || ''}
                                    onChange={(e) => handleCableSourceChange(index, e.target.value)}
                                >
                                    <MenuItem value="access_point">Access Point</MenuItem>
                                    <MenuItem value="ip_phone">IP Phone</MenuItem>
                                    <MenuItem value="end_user_device">End-User Device</MenuItem>
                                    <MenuItem value="switch">Switch</MenuItem>
                                    <MenuItem value="router">Router</MenuItem>
                                    <MenuItem value="server">Server</MenuItem>
                                    <MenuItem value="firewall">Firewall</MenuItem>
                                    <MenuItem value="patch_panel">Patch Panel</MenuItem>
                                    {[...Array(numIdfs)].map((_, idx) => (
                                        idx + 1 !== idf && 
                                        <MenuItem key={idx + 1} value={`IDF_${idx + 1}`}>{`IDF ${idx + 1}`}</MenuItem>
                                    ))}
                                    <MenuItem value="MDF">MDF</MenuItem>
                                    <MenuItem value="OTHER">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Identifier"
                                value={port.identifier || ''}
                                InputProps={{ readOnly: true }}
                                fullWidth
                                margin="dense"
                            />
                            {port.connectedTo && (
                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                    Connected to: {port.connectedTo}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(localPorts)}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

PortSetupDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    ports: PropTypes.array.isRequired,
    numIdfs: PropTypes.number.isRequired,
    idf: PropTypes.number.isRequired,
    onPortChange: PropTypes.func.isRequired,
    component: PropTypes.shape({
        type: PropTypes.string.isRequired,
        id: PropTypes.number.isRequired,
    }).isRequired,
};

export default PortSetupDialog;
