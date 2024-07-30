import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfUsers, setIdfUsers] = useState({1: ''});

    const handleIdfChange = (e) => {
        const value = Math.max(parseInt(e.target.value) || 1, 1);
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
        onSubmit({ idfs: numIdfs, idfUsers });
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
                label="Number of IDFs"
                type="number"
                value={numIdfs}
                onChange={handleIdfChange}
                required
                inputProps={{ min: 1 }}
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
                    />
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
