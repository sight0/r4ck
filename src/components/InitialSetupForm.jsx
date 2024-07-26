import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

const InitialSetupForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        endDevices: '',
        idfs: '',
        mdfs: 1,
        usersPerIdf: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ m: 2 }}>
            <TextField
                fullWidth
                margin="normal"
                name="endDevices"
                label="Number of End Devices"
                type="number"
                value={formData.endDevices}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                name="idfs"
                label="Number of IDFs"
                type="number"
                value={formData.idfs}
                onChange={handleChange}
                required
            />
            <TextField
                fullWidth
                margin="normal"
                name="usersPerIdf"
                label="Users per IDF"
                type="number"
                value={formData.usersPerIdf}
                onChange={handleChange}
                required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Start Design
            </Button>
        </Box>
    );
};

export default InitialSetupForm;
