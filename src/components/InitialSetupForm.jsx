import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfUsers, setIdfUsers] = useState({1: ''});
    const [numDevices, setNumDevices] = useState('');

    const handleIdfChange = (e) => {
        const value = Math.max(Math.min(parseInt(e.target.value) || 1, 10), 1);
        setNumIdfs(value);
        
        // Update idfUsers object when numIdfs changes
        const newIdfUsers = {};
        for (let i = 1; i <= value; i++) {
            newIdfUsers[i] = idfUsers[i] || '';
        }
        setIdfUsers(newIdfUsers);
    };

    const handleUserChange = (idf, value) => {
        setIdfUsers(prevUsers => ({
            ...prevUsers,
            [idf]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedIdfUsers = Object.entries(idfUsers).reduce((acc, [idf, users]) => {
            acc[idf] = parseInt(users) || 0;
            return acc;
        }, {});
        onSubmit({ 
            idfs: numIdfs, 
            idfUsers: formattedIdfUsers,
            numDevices: parseInt(numDevices) || 0
        });
    };

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
                {Object.keys(idfUsers).map((idf) => (
                    <TextField
                        key={idf}
                        fullWidth
                        margin="normal"
                        name={`idf-${idf}`}
                        label={`Users for IDF ${idf}`}
                        type="number"
                        value={idfUsers[idf]}
                        onChange={(e) => handleUserChange(idf, e.target.value)}
                        required
                        inputProps={{ min: 0 }}
                    />
                ))}
            </Box>
            <TextField
                fullWidth
                margin="normal"
                name="numDevices"
                label="Total Number of Devices"
                type="number"
                value={numDevices}
                onChange={(e) => setNumDevices(e.target.value)}
                required
                inputProps={{ min: 0 }}
            />
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
