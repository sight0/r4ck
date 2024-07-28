import PropTypes from 'prop-types';
import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const InitialSetupForm = ({ onSubmit }) => {
    const [numIdfs, setNumIdfs] = useState(1);
    const [idfUsers, setIdfUsers] = useState({});

    const handleIdfChange = (e) => {
        setNumIdfs(parseInt(e.target.value) || 1);
    };

    const handleUserChange = (idf, value) => {
        setIdfUsers({ ...idfUsers, [idf]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ idfs: numIdfs, idfUsers });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ m: 2 }}>
            <TextField
                fullWidth
                margin="normal"
                name="idfs"
                label="Number of IDFs"
                type="number"
                value={numIdfs}
                onChange={handleIdfChange}
                required
            />
            {[...Array(numIdfs)].map((_, index) => (
                <TextField
                    key={index}
                    fullWidth
                    margin="normal"
                    name={`idf-${index + 1}`}
                    label={`Users for IDF ${index + 1}`}
                    type="number"
                    value={idfUsers[index + 1] || ''}
                    onChange={(e) => handleUserChange(index + 1, e.target.value)}
                    required
                />
            ))}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Start Design
            </Button>
        </Box>
    );
};

InitialSetupForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
}

export default InitialSetupForm;
