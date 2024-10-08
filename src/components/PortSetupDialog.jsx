import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { generateSmartIdentifier, isEndUserDeviceType, componentTypeMap } from '../utils/identifierUtils';

const PortSetupDialog = ({ open, onClose, ports, numIdfs, idf, onPortChange, component }) => {
    const componentType = component.type;
    const [localPorts, setLocalPorts] = useState(ports);

    useEffect(() => {
        setLocalPorts(ports);
    }, [ports]);

    const getIdentifierExplanation = () => {
        return `Identifier Structure:
        A/B: End-user device / Infrastructure device
        XX: Device type code
        YY: IDF number
        ZZ: Device sequence
        NNN: Port number`;
    };

    const handleCableSourceChange = (index, value) => {
        const updatedPorts = [...localPorts];
        updatedPorts[index].cableSource = value;
        updatedPorts[index].identifier = generateSmartIdentifier(
            value,
            idf,
            component.sequence,
            index + 1
        );
        setLocalPorts(updatedPorts);
        onPortChange(index, 'cableSource', value);
        onPortChange(index, 'identifier', updatedPorts[index].identifier);
    };

    const getMenuItems = () => {
        if (componentType === 'patch_panel') {
            return [
                <MenuItem value="end_user_device" key="end_user_device">End User Device</MenuItem>,
                <MenuItem value="ip_phone" key="ip_phone">IP Phone</MenuItem>,
                <MenuItem value="access_point" key="access_point">Access Point</MenuItem>
            ];
        } else if (componentType === 'fiber_patch_panel') {
            return [
                // <MenuItem value="MDF" key="MDF">MDF</MenuItem>,
                ...[...Array(numIdfs)].map((_, i) => (
                    <MenuItem key={`IDF_${i + 1}`} value={`IDF_${i + 1}`} disabled={i + 1 === idf}>
                        {i + 1 === numIdfs ? 'MDF' : `IDF ${i + 1}`}
                    </MenuItem>
                ))
            ];
        }
        return [];
    };

    return (
        <Dialog open={open} onClose={() => onClose(localPorts)} maxWidth="lg" fullWidth>
            <DialogTitle>
                Configure Ports for {componentType}
                <Tooltip title={getIdentifierExplanation()} arrow>
                    <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
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
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {getMenuItems()}
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
        id: PropTypes.string.isRequired,
        sequence: PropTypes.number.isRequired,
    }).isRequired,
};

export default PortSetupDialog;
