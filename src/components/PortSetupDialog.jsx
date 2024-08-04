import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';

const PortSetupDialog = ({ open, onClose, ports, numIdfs, idf, onPortChange }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Port Setup</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    {ports.map((port, index) => (
                        <Box key={index} sx={{ border: '1px solid #ccc', padding: 1, borderRadius: 1 }}>
                            <TextField
                                label={`Port ${index + 1}`}
                                value={port.label || ''}
                                onChange={(e) => onPortChange(index, 'label', e.target.value)}
                                fullWidth
                                margin="dense"
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Device</InputLabel>
                                <Select
                                    value={port.cableSource || ''}
                                    onChange={(e) => onPortChange(index, 'cableSource', e.target.value)}
                                >
                                    <MenuItem value="AP">Access Point</MenuItem>
                                    <MenuItem value="IP_PHONE">IP Telephone</MenuItem>
                                    <MenuItem value="END_USER_DEVICE">End-User Device</MenuItem>
                                    {[...Array(numIdfs)].map((_, idx) => (
                                        idx + 1 !== idf && 
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
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
};

export default PortSetupDialog;
