import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography, Box, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, IconButton, Tooltip, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

const ConnectionWizard = ({ open, onClose, components, currentIdf, onConnectionCreate, existingConnections, onConnectionUpdate, onConnectionDelete }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [connection, setConnection] = useState({
        firstComponent: '',
        firstPort: '',
        secondComponent: '',
        secondPort: '',
        type: '',
        speed: '',
        notes: ''
    });
    const [availableSecondComponents, setAvailableSecondComponents] = useState([]);
    const [isAddingConnection, setIsAddingConnection] = useState(false);
    const [editingConnection, setEditingConnection] = useState(null);

    const steps = [
        { label: 'Select Devices', fields: ['firstComponent', 'secondComponent'] },
        { label: 'Select Ports', fields: ['firstPort', 'secondPort'] },
        { label: 'Connection Details', fields: ['type', 'speed', 'notes'] },
        { label: 'Review', fields: [] }
    ];

    useEffect(() => {
        if (connection.firstComponent) {
            setAvailableSecondComponents(components.filter(c => c.id !== connection.firstComponent));
        }
    }, [connection.firstComponent, components]);

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    const handleAddConnectionClick = () => {
        setIsAddingConnection(true);
        setConnection({
            firstComponent: '',
            firstPort: '',
            secondComponent: '',
            secondPort: '',
            type: '',
            speed: '',
            notes: ''
        });
        setActiveStep(0);
    };

    const handleFinish = () => {
        const newConnection = {
            id: editingConnection ? editingConnection.id : Date.now(),
            deviceA: { componentId: connection.firstComponent, port: connection.firstPort },
            deviceB: { componentId: connection.secondComponent, port: connection.secondPort },
            idf: currentIdf,
            type: connection.type,
            speed: connection.speed,
            notes: connection.notes
        };
        
        if (editingConnection) {
            onConnectionUpdate(newConnection);
        } else {
            onConnectionCreate(newConnection);
        }
        
        setIsAddingConnection(false);
        setEditingConnection(null);
        setConnection({
            firstComponent: '',
            firstPort: '',
            secondComponent: '',
            secondPort: '',
            type: '',
            speed: '',
            notes: ''
        });
    };

    const handleEdit = (conn) => {
        setEditingConnection(conn);
        setConnection({
            firstComponent: conn.deviceA.componentId,
            firstPort: conn.deviceA.port,
            secondComponent: conn.deviceB.componentId,
            secondPort: conn.deviceB.port,
            type: conn.type || '',
            speed: conn.speed || '',
            notes: conn.notes || ''
        });
        setIsAddingConnection(true);
        setActiveStep(0);
    };

    const handleDelete = (connectionId) => onConnectionDelete(connectionId);

    const handleChange = (field, value) => {
        setConnection(prev => ({ ...prev, [field]: value }));
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
        const currentStep = steps[step];
        return (
            <Box sx={{ mt: 2 }}>
                {currentStep.fields.map((field) => {
                    switch (field) {
                        case 'firstComponent':
                        case 'secondComponent':
                            return (
                                <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                                    <InputLabel>{field === 'firstComponent' ? 'First Device' : 'Second Device'}</InputLabel>
                                    <Select
                                        value={connection[field]}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                    >
                                        {(field === 'firstComponent' ? components : availableSecondComponents).map((component) => (
                                            <MenuItem key={component.id} value={component.id}>
                                                {component.name} ({component.type})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                        case 'firstPort':
                        case 'secondPort':
                            const ports = components.find(c => c.id === connection[field === 'firstPort' ? 'firstComponent' : 'secondComponent'])?.ports || [];
                            return (
                                <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                                    <InputLabel>{field === 'firstPort' ? 'First Port' : 'Second Port'}</InputLabel>
                                    <Select
                                        value={connection[field]}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                    >
                                        {ports.map((port, index) => (
                                            <MenuItem key={index} value={port.label}>
                                                {port.label} - {port.cableSource || port.deviceType || 'Unknown'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                        case 'type':
                            return (
                                <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                                    <InputLabel>Connection Type</InputLabel>
                                    <Select
                                        value={connection.type}
                                        onChange={(e) => handleChange('type', e.target.value)}
                                    >
                                        <MenuItem value="copper">Copper</MenuItem>
                                        <MenuItem value="fiber">Fiber</MenuItem>
                                        <MenuItem value="wireless">Wireless</MenuItem>
                                    </Select>
                                </FormControl>
                            );
                        case 'speed':
                            return (
                                <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                                    <InputLabel>Connection Speed</InputLabel>
                                    <Select
                                        value={connection.speed}
                                        onChange={(e) => handleChange('speed', e.target.value)}
                                    >
                                        <MenuItem value="10Mbps">10 Mbps</MenuItem>
                                        <MenuItem value="100Mbps">100 Mbps</MenuItem>
                                        <MenuItem value="1Gbps">1 Gbps</MenuItem>
                                        <MenuItem value="10Gbps">10 Gbps</MenuItem>
                                    </Select>
                                </FormControl>
                            );
                        case 'notes':
                            return (
                                <TextField
                                    key={field}
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    value={connection.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                            );
                        default:
                            return null;
                    }
                })}
                {step === steps.length - 1 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Connection Summary</Typography>
                        <Typography>First Device: {components.find(c => c.id === connection.firstComponent)?.name} ({components.find(c => c.id === connection.firstComponent)?.type})</Typography>
                        <Typography>First Port: {connection.firstPort}</Typography>
                        <Typography>Second Device: {components.find(c => c.id === connection.secondComponent)?.name} ({components.find(c => c.id === connection.secondComponent)?.type})</Typography>
                        <Typography>Second Port: {connection.secondPort}</Typography>
                        <Typography>Connection Type: {connection.type}</Typography>
                        <Typography>Connection Speed: {connection.speed}</Typography>
                        <Typography>Notes: {connection.notes}</Typography>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid #333', pb: 2 }}>
                Connection Wizard
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                {!isAddingConnection ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>Existing Connections</Typography>
                        {renderExistingConnections()}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddConnectionClick}
                            sx={{ 
                                mt: 2, 
                                backgroundColor: '#FFD700',
                                color: '#000',
                                '&:hover': {
                                    backgroundColor: '#FFC700',
                                }
                            }}
                        >
                            Add New Connection
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map(({ label }) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {renderStepContent(activeStep)}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid #333', pt: 2 }}>
                <Button onClick={onClose} sx={{ color: '#fff' }}>Close</Button>
                {isAddingConnection && (
                    <>
                        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: '#fff' }}>
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button 
                                onClick={handleFinish}
                                sx={{ 
                                    backgroundColor: '#FFD700',
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: '#FFC700',
                                    }
                                }}
                            >
                                Finish
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleNext}
                                sx={{ 
                                    backgroundColor: '#FFD700',
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: '#FFC700',
                                    }
                                }}
                            >
                                Next
                            </Button>
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
