import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ConnectionWizard = ({ open, onClose, components, currentIdf, onConnectionCreate }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [sourceComponent, setSourceComponent] = useState('');
    const [sourcePort, setSourcePort] = useState('');
    const [destinationComponent, setDestinationComponent] = useState('');
    const [destinationPort, setDestinationPort] = useState('');
    const [availableDestinations, setAvailableDestinations] = useState([]);

    const steps = ['Select Source', 'Select Source Port', 'Select Destination', 'Select Destination Port', 'Review'];

    useEffect(() => {
        if (sourceComponent) {
            const source = components.find(c => c.id === sourceComponent);
            if (source.type === 'patch_panel') {
                setAvailableDestinations(components.filter(c => c.id !== sourceComponent));
            } else {
                setAvailableDestinations(components.filter(c => c.type === 'patch_panel'));
            }
        }
    }, [sourceComponent, components]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFinish = () => {
        const newConnection = {
            sourceComponentId: sourceComponent,
            sourcePort: sourcePort,
            destinationComponentId: destinationComponent,
            destinationPort: destinationPort,
            idf: currentIdf
        };
        onConnectionCreate(newConnection);
        onClose();
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <FormControl fullWidth>
                        <InputLabel>Source Component</InputLabel>
                        <Select
                            value={sourceComponent}
                            onChange={(e) => setSourceComponent(e.target.value)}
                        >
                            {components.map((component) => (
                                <MenuItem key={component.id} value={component.id}>
                                    {component.name} ({component.type})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 1:
                const sourcePorts = components.find(c => c.id === sourceComponent)?.ports || [];
                return (
                    <FormControl fullWidth>
                        <InputLabel>Source Port</InputLabel>
                        <Select
                            value={sourcePort}
                            onChange={(e) => setSourcePort(e.target.value)}
                        >
                            {sourcePorts.map((port, index) => (
                                <MenuItem key={index} value={port.label}>
                                    {port.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 2:
                return (
                    <FormControl fullWidth>
                        <InputLabel>Destination Component</InputLabel>
                        <Select
                            value={destinationComponent}
                            onChange={(e) => setDestinationComponent(e.target.value)}
                        >
                            {availableDestinations.map((component) => (
                                <MenuItem key={component.id} value={component.id}>
                                    {component.name} ({component.type})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 3:
                const destPorts = components.find(c => c.id === destinationComponent)?.ports || [];
                return (
                    <FormControl fullWidth>
                        <InputLabel>Destination Port</InputLabel>
                        <Select
                            value={destinationPort}
                            onChange={(e) => setDestinationPort(e.target.value)}
                        >
                            {destPorts.map((port, index) => (
                                <MenuItem key={index} value={port.label}>
                                    {port.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 4:
                const sourceComp = components.find(c => c.id === sourceComponent);
                const destComp = components.find(c => c.id === destinationComponent);
                return (
                    <Box>
                        <Typography>Source: {sourceComp?.name} ({sourceComp?.type})</Typography>
                        <Typography>Source Port: {sourcePort}</Typography>
                        <Typography>Destination: {destComp?.name} ({destComp?.type})</Typography>
                        <Typography>Destination Port: {destinationPort}</Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Connection Wizard</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 2 }}>
                    {renderStepContent(activeStep)}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                {activeStep === steps.length - 1 ? (
                    <Button onClick={handleFinish}>Finish</Button>
                ) : (
                    <Button onClick={handleNext}>Next</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

ConnectionWizard.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    currentIdf: PropTypes.number.isRequired,
    onConnectionCreate: PropTypes.func.isRequired,
};

export default ConnectionWizard;
