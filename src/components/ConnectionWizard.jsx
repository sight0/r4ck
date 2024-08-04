import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography, Box, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, IconButton, Tooltip, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const ConnectionWizard = ({ open, onClose, components, currentIdf, onConnectionCreate, existingConnections, onConnectionUpdate, onConnectionDelete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [firstComponent, setFirstComponent] = useState('');
    const [firstPort, setFirstPort] = useState('');
    const [secondComponent, setSecondComponent] = useState('');
    const [secondPort, setSecondPort] = useState('');
    const [availableSecondComponents, setAvailableSecondComponents] = useState([]);
    const [isAddingConnection, setIsAddingConnection] = useState(false);
    const [editingConnection, setEditingConnection] = useState(null);
    const [connectionType, setConnectionType] = useState('');
    const [connectionSpeed, setConnectionSpeed] = useState('');
    const [connectionNotes, setConnectionNotes] = useState('');

    const steps = ['Select First Device', 'Select First Port', 'Select Second Device', 'Select Second Port', 'Connection Details', 'Review'];

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

    const handleAddConnectionClick = () => {
        setIsAddingConnection(true);
        resetConnectionForm();
    };

    const resetConnectionForm = () => {
        setActiveStep(0);
        setFirstComponent('');
        setFirstPort('');
        setSecondComponent('');
        setSecondPort('');
    };

    const handleFinish = () => {
        const newConnection = {
            id: editingConnection ? editingConnection.id : Date.now(),
            deviceA: {
                componentId: firstComponent,
                port: firstPort
            },
            deviceB: {
                componentId: secondComponent,
                port: secondPort
            },
            idf: currentIdf,
            type: connectionType,
            speed: connectionSpeed,
            notes: connectionNotes
        };
        if (editingConnection) {
            onConnectionUpdate(newConnection);
        } else {
            onConnectionCreate(newConnection);
        }
        resetConnectionForm();
        setIsAddingConnection(false);
        setEditingConnection(null);
    };

    const handleEdit = (connection) => {
        setEditingConnection(connection);
        setFirstComponent(connection.deviceA.componentId);
        setFirstPort(connection.deviceA.port);
        setSecondComponent(connection.deviceB.componentId);
        setSecondPort(connection.deviceB.port);
        setConnectionType(connection.type || '');
        setConnectionSpeed(connection.speed || '');
        setConnectionNotes(connection.notes || '');
        setIsAddingConnection(true);
        setActiveStep(0);
    };

    const handleDelete = (connectionId) => {
        onConnectionDelete(connectionId);
    };

    const renderExistingConnections = () => (
        <List>
            {existingConnections.map((connection, index) => (
                <React.Fragment key={connection.id}>
                    <ListItem
                        secondaryAction={
                            <Box>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(connection)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(connection.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        }
                    >
                        <ListItemText
                            primary={
                                <Typography>
                                    {`${getComponentName(connection.deviceA.componentId)} (${connection.deviceA.port}) - ${getComponentName(connection.deviceB.componentId)} (${connection.deviceB.port})`}
                                    <Tooltip title={`Type: ${connection.type || 'N/A'}, Speed: ${connection.speed || 'N/A'}, Notes: ${connection.notes || 'N/A'}`}>
                                        <InfoIcon fontSize="small" style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
                                    </Tooltip>
                                </Typography>
                            }
                            secondary={`IDF ${connection.idf}`}
                        />
                    </ListItem>
                    {index < existingConnections.length - 1 && <Divider />}
                </React.Fragment>
            ))}
        </List>
    );

    const getComponentName = (componentId) => {
        const component = components.find(c => c.id === componentId);
        return component ? component.name : 'Unknown';
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
                                    {port.label} - {port.cableSource || 'Unknown'}
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
                return (
                    <Box>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Connection Type</InputLabel>
                            <Select
                                value={connectionType}
                                onChange={(e) => setConnectionType(e.target.value)}
                            >
                                <MenuItem value="copper">Copper</MenuItem>
                                <MenuItem value="fiber">Fiber</MenuItem>
                                <MenuItem value="wireless">Wireless</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Connection Speed</InputLabel>
                            <Select
                                value={connectionSpeed}
                                onChange={(e) => setConnectionSpeed(e.target.value)}
                            >
                                <MenuItem value="10Mbps">10 Mbps</MenuItem>
                                <MenuItem value="100Mbps">100 Mbps</MenuItem>
                                <MenuItem value="1Gbps">1 Gbps</MenuItem>
                                <MenuItem value="10Gbps">10 Gbps</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={4}
                            value={connectionNotes}
                            onChange={(e) => setConnectionNotes(e.target.value)}
                        />
                    </Box>
                );
            case 5:
                const firstComp = components.find(c => c.id === firstComponent);
                const secondComp = components.find(c => c.id === secondComponent);
                return (
                    <Box>
                        <Typography>First Device: {firstComp?.name} ({firstComp?.type})</Typography>
                        <Typography>First Port: {firstPort}</Typography>
                        <Typography>Second Device: {secondComp?.name} ({secondComp?.type})</Typography>
                        <Typography>Second Port: {secondPort}</Typography>
                        <Typography>Connection Type: {connectionType}</Typography>
                        <Typography>Connection Speed: {connectionSpeed}</Typography>
                        <Typography>Notes: {connectionNotes}</Typography>
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
                {!isAddingConnection ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>Existing Connections</Typography>
                        {renderExistingConnections()}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddConnectionClick}
                            sx={{ mt: 2 }}
                        >
                            Add New Connection
                        </Button>
                    </Box>
                ) : (
                    <Box>
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
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {isAddingConnection && (
                    <>
                        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
                        {activeStep === steps.length - 1 ? (
                            <Button onClick={handleFinish}>Finish</Button>
                        ) : (
                            <Button onClick={handleNext}>Next</Button>
                        )}
                    </>
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
    onConnectionUpdate: PropTypes.func.isRequired,
    onConnectionDelete: PropTypes.func.isRequired,
    existingConnections: PropTypes.array.isRequired,
};

export default ConnectionWizard;
