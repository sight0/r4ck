import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfData, setIdfData] = useState({
        1: { rackSize: 42, devices: [] }
    });

    const deviceTypes = [
        { value: 'access_point', label: 'Access Point' },
        { value: 'ip_phone', label: 'IP Telephone' },
        { value: 'end_user_device', label: 'End-User Device' },
    ];

    const handleIdfChange = (e) => {
        const value = Math.max(Math.min(parseInt(e.target.value) || 1, 10), 1);
        setNumIdfs(value);
        
        const newIdfData = {};
        for (let i = 1; i <= value; i++) {
            newIdfData[i] = idfData[i] || { rackSize: 42, devices: [] };
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

    const addDevice = (idf, type) => {
        setIdfData(prevData => ({
            ...prevData,
            [idf]: {
                ...prevData[idf],
                devices: [...prevData[idf].devices, { type, count: 1 }]
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
        const updatedIdfData = {
            ...idfData,
            [numIdfs]: {
                rackSize: 42,
                devices: [
                    { type: 'ont', count: 1 }
                ]
            }
        };
        onSubmit({
            numIdfs: numIdfs+1,
            idfData: updatedIdfData
        });
    };

    const rackSizes = [18, 20, 22, 24, 27, 30, 32, 36, 38, 42];

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ 
            width: {xs:'100%',sm:'90%',md:'70%',lg:'50%'}, 
            margin: 'auto', 
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 100px)', // Adjust based on your layout
        }}>
            <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
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
            </Paper>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mt: 2, mb: 2 }}>
                {Object.keys(idfData).map((idf) => (
                    <Paper key={idf} elevation={2} sx={{ mb: 4, p: 2, backgroundColor: '#0f0f0f' }}>
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
                                <Typography sx={{ mr: 1, flexGrow: 1 }}>
                                    {deviceTypes.find(t => t.value === device.type).label}
                                </Typography>
                                <TextField
                                    sx={{ mr: 1, flexGrow: 1 }}
                                    type="number"
                                    label="Count"
                                    value={device.count}
                                    onChange={(e) => handleDeviceChange(idf, index, 'count', parseInt(e.target.value) || 0)}
                                    inputProps={{ min: 1 }}
                                />
                                <Button onClick={() => removeDevice(idf, index)} startIcon={<RemoveIcon />}>
                                    Remove
                                </Button>
                            </Box>
                        ))}
                        <Box sx={{ mt: 2 }}>
                            {deviceTypes.map(type => (
                                <Button 
                                    key={type.value}
                                    startIcon={<AddIcon />} 
                                    onClick={() => addDevice(idf, type.value)} 
                                    sx={{ mr: 1, mb: 1 }}
                                >
                                    Add {type.label}
                                </Button>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
            <Paper elevation={3} sx={{ p: 2, mt: 'auto' }}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Start Design
                </Button>
            </Paper>
        </Box>
    );
};

InitialSetupForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default InitialSetupForm;
