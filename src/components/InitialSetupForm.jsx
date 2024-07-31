import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfData, setIdfData] = useState({1: {ports: '', rackSize: 42}});

    const handleIdfChange = (e) => {
        const value = Math.max(Math.min(parseInt(e.target.value) || 1, 10), 1);
        setNumIdfs(value);
        
        // Update idfData object when numIdfs changes
        const newIdfData = {};
        for (let i = 1; i <= value; i++) {
            newIdfData[i] = idfData[i] || {ports: '', rackSize: 42};
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedIdfData = Object.entries(idfData).reduce((acc, [idf, data]) => {
            acc[idf] = {
                ports: parseInt(data.ports) || 0,
                rackSize: parseInt(data.rackSize) || 42
            };
            return acc;
        }, {});

        onSubmit({
            numIdfs: numIdfs,
            idfData: formattedIdfData
        });
    };

    const rackSizes = [42, 45, 48, 52];

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: {xs:'100%',sm:'90%',md:'50%',lg:'20%'}, margin: 'auto', mt: 4 }}>
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
            <Box sx={{ maxHeight: 'md', overflowY: 'auto', mt: 2 }}>
                {Object.keys(idfData).map((idf) => (
                    <Box key={idf} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">IDF {idf}</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            name={`idf-${idf}-ports`}
                            label={`Number of Ports for IDF ${idf}`}
                            type="number"
                            value={idfData[idf].ports}
                            onChange={(e) => handleDataChange(idf, 'ports', e.target.value)}
                            required
                            inputProps={{ min: 0 }}
                        />
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
