import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const ConnectionWizard = ({ open, onClose, components, currentIdf, onConnectionCreate }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [firstComponent, setFirstComponent] = useState('');
    const [firstPort, setFirstPort] = useState('');
    const [secondComponent, setSecondComponent] = useState('');
    const [secondPort, setSecondPort] = useState('');
    const [availableSecondComponents, setAvailableSecondComponents] = useState([]);

    const steps = ['Select First Device', 'Select First Port', 'Select Second Device', 'Select Second Port', 'Review'];

    useEffect(() => {
        if (firstComponent) {
            const first = components.find(c => c.id === firstComponent);
            // Allow connections between all types of components
            setAvailableSecondComponents(components.filter(c => c.id !== firstComponent));
        }
    }, [firstComponent, components]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFinish = () => {
        const newConnection = {
            deviceA: {
                componentId: firstComponent,
                port: firstPort
            },
            deviceB: {
                componentId: secondComponent,
                port: secondPort
            },
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
                        <InputLabel>First Device</InputLabel>
                        <Select
                            value={firstComponent}
                            onChange={(e) => setFirstComponent(e.target.value)}
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
                const firstPorts = components.find(c => c.id === firstComponent)?.ports || [];
                return (
                    <FormControl fullWidth>
                        <InputLabel>First Port</InputLabel>
                        <Select
                            value={firstPort}
                            onChange={(e) => setFirstPort(e.target.value)}
                        >
                            {firstPorts.map((port, index) => (
                                <MenuItem key={index} value={port.label}>
                                    {port.label} - {port.deviceType || 'Unknown'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 2:
                return (
                    <FormControl fullWidth>
                        <InputLabel>Second Device</InputLabel>
                        <Select
                            value={secondComponent}
                            onChange={(e) => setSecondComponent(e.target.value)}
                        >
                            {availableSecondComponents.map((component) => (
                                <MenuItem key={component.id} value={component.id}>
                                    {component.name} ({component.type})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 3:
                const secondPorts = components.find(c => c.id === secondComponent)?.ports || [];
                return (
                    <FormControl fullWidth>
                        <InputLabel>Second Port</InputLabel>
                        <Select
                            value={secondPort}
                            onChange={(e) => setSecondPort(e.target.value)}
                        >
                            {secondPorts.map((port, index) => (
                                <MenuItem key={index} value={port.label}>
                                    {port.label} - {port.deviceType || 'Unknown'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 4:
                const firstComp = components.find(c => c.id === firstComponent);
                const secondComp = components.find(c => c.id === secondComponent);
                return (
                    <Box>
                        <Typography>First Device: {firstComp?.name} ({firstComp?.type})</Typography>
                        <Typography>First Port: {firstPort}</Typography>
                        <Typography>Second Device: {secondComp?.name} ({secondComp?.type})</Typography>
                        <Typography>Second Port: {secondPort}</Typography>
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
