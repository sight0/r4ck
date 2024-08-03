import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfData, setIdfData] = useState({
        1: { rackSize: 42, devices: [{ type: 'user_device', count: 0 }] }
    });

    const deviceTypes = [
        { value: 'user_device', label: 'User Device' },
        { value: 'access_point', label: 'Access Point' },
        { value: 'ip_telephone', label: 'IP Telephone' },
    ];

    const handleIdfChange = (e) => {
        const value = Math.max(Math.min(parseInt(e.target.value) || 1, 10), 1);
        setNumIdfs(value);
        
        const newIdfData = {};
        for (let i = 1; i <= value; i++) {
            newIdfData[i] = idfData[i] || { rackSize: 42, devices: [{ type: 'user_device', count: 0 }] };
        }
        setIdfData(newIdfData);
    };

    const handleDataChange = (idf, field, value) => {
        setIdfData(prevData => ({
            ...prevData,
            [idf]: {
                ...prevData[idf],
                [field]: value
            }
        }));
    };

    const handleDeviceChange = (idf, index, field, value) => {
        setIdfData(prevData => ({
            ...prevData,
            [idf]: {
                ...prevData[idf],
                devices: prevData[idf].devices.map((device, i) => 
                    i === index ? { ...device, [field]: value } : device
                )
            }
        }));
    };

    const addDevice = (idf) => {
        setIdfData(prevData => ({
            ...prevData,
            [idf]: {
                ...prevData[idf],
                devices: [...prevData[idf].devices, { type: 'user_device', count: 0 }]
            }
        }));
    };

    const removeDevice = (idf, index) => {
        setIdfData(prevData => ({
            ...prevData,
            [idf]: {
                ...prevData[idf],
                devices: prevData[idf].devices.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            numIdfs: numIdfs,
            idfData: idfData
        });
    };

    const rackSizes = [18, 20, 22, 24, 27, 30, 32, 36, 38, 42];

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: {xs:'100%',sm:'90%',md:'70%',lg:'50%'}, margin: 'auto', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Initial Setup
            </Typography>
            <TextField
                fullWidth
                margin="normal"
                name="idfs"
                label="Number of IDFs (max 10)"
                type="number"
                value={numIdfs}
                onChange={handleIdfChange}
                required
                inputProps={{ min: 1, max: 10 }}
            />
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto', mt: 2 }}>
                {Object.keys(idfData).map((idf) => (
                    <Box key={idf} sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
                        <Typography variant="h6" gutterBottom>IDF {idf}</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Rack Size</InputLabel>
                            <Select
                                value={idfData[idf].rackSize}
                                onChange={(e) => handleDataChange(idf, 'rackSize', e.target.value)}
                                label="Rack Size"
                            >
                                {rackSizes.map(size => (
                                    <MenuItem key={size} value={size}>{size}U</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Devices</Typography>
                        {idfData[idf].devices.map((device, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <FormControl sx={{ mr: 1, flexGrow: 1 }}>
                                    <InputLabel>Device Type</InputLabel>
                                    <Select
                                        value={device.type}
                                        onChange={(e) => handleDeviceChange(idf, index, 'type', e.target.value)}
                                        label="Device Type"
                                    >
                                        {deviceTypes.map(type => (
                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    sx={{ mr: 1, flexGrow: 1 }}
                                    type="number"
                                    label="Count"
                                    value={device.count}
                                    onChange={(e) => handleDeviceChange(idf, index, 'count', parseInt(e.target.value) || 0)}
                                    inputProps={{ min: 0 }}
                                />
                                <IconButton onClick={() => removeDevice(idf, index)} disabled={idfData[idf].devices.length === 1}>
                                    <RemoveIcon />
                                </IconButton>
                            </Box>
                        ))}
                        <Button startIcon={<AddIcon />} onClick={() => addDevice(idf)} sx={{ mt: 1 }}>
                            Add Device
                        </Button>
                    </Box>
                ))}
            </Box>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Start Design
            </Button>
        </Box>
    );
};

InitialSetupForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default InitialSetupForm;
