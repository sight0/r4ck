import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { generateSmartIdentifier } from '../utils/identifierUtils';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel, Typography, Box, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, TextField, Chip, Card, CardContent, Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useTheme } from "@mui/material/styles";

const ConnectionWizard = ({ open, onClose, components, currentIdf, onConnectionCreate, existingConnections, onConnectionUpdate, onConnectionDelete }) => {
    const theme = useTheme();
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
        const getPortDetails = (componentId, portLabel) => {
            const component = components.find(c => c.id === componentId);
            const port = component.ports.find(p => p.label === portLabel);
            return {
                componentId,
                port: portLabel,
                identifier: port.identifier,
                deviceType: component.type
                // deviceType: component.type === 'patch_panel' ? 'Patch Panel' : undefined
            };
        };

        const newConnection = {
            id: editingConnection ? editingConnection.id : Date.now(),
            deviceA: getPortDetails(connection.firstComponent, connection.firstPort),
            deviceB: getPortDetails(connection.secondComponent, connection.secondPort),
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

    const renderExistingConnections = () => {
        if (existingConnections.length === 0) {
            return (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                    No connections yet.
                </Typography>
            );
        }

        return (
            <Grid container spacing={2}>
                {existingConnections.map((connection, index) => (
                    <Grid item xs={12} sm={6} md={4} key={connection.id}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        Connection {index + 1}
                                    </Typography>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleEdit(connection)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(connection.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {connection.deviceA.deviceType}&nbsp;(
                                        {getComponentName(connection.deviceA.componentId)})
                                    </Typography>
                                    <ArrowRightAltIcon sx={{ mx: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {connection.deviceB.deviceType}&nbsp;(
                                        {getComponentName(connection.deviceB.componentId)})
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {connection.deviceA.port} ({connection.deviceA.identifier}) → {connection.deviceB.port} ({connection.deviceB.identifier || "N/A"})
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    <Chip label={`IDF ${connection.idf}`} size="small" />
                                    <Chip label={`Type: ${connection.type || 'N/A'}`} size="small" />
                                    <Chip label={`Speed: ${connection.speed || 'N/A'}`} size="small" />
                                    {connection.notes && (
                                        <Tooltip title={connection.notes}>
                                            <Chip icon={<InfoIcon />} label="Notes" size="small" />
                                        </Tooltip>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

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
                            const component = components.find(c => c.id === connection[field === 'firstPort' ? 'firstComponent' : 'secondComponent']);
                            const ports = component?.ports || [];
                            const connectedPorts = new Set(existingConnections.flatMap(conn => 
                                [conn.deviceA.port, conn.deviceB.port]
                            ));
                            const availablePorts = ports.filter(port => !connectedPorts.has(port.label));
                            return (
                                <FormControl fullWidth key={field} sx={{ mb: 2 }}>
                                    <InputLabel>{field === 'firstPort' ? 'First Port' : 'Second Port'}</InputLabel>
                                    <Select
                                        value={connection[field]}
                                        onChange={(e) => handleChange(field, e.target.value)}
                                    >
                                        {availablePorts.map((port, index) => (
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
                    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Connection Summary</Typography>
                        <Typography>First Device: {components.find(c => c.id === connection.firstComponent)?.name} ({components.find(c => c.id === connection.firstComponent)?.type})</Typography>
                        <Typography>First Port: {connection.firstPort}</Typography>
                        <Typography>Second Device: {components.find(c => c.id === connection.secondComponent)?.name} ({components.find(c => c.id === connection.secondComponent)?.type})</Typography>
                        <Typography>Second Port: {connection.secondPort}</Typography>
                        <Typography>Connection Type: {connection.type}</Typography>
                        <Typography>Connection Speed: {connection.speed}</Typography>
                        <Typography>Notes: {connection.notes}</Typography>
                    </Paper>
                )}
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
                Connection Wizard
            </DialogTitle>
            <DialogContent sx={{ mt: 2, minHeight: '60vh' }}>
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
