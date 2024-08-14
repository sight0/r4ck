import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, List, ListItem, ListItemText, IconButton, Typography, Box,
    Tooltip, Divider, useTheme
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const WorkspaceManager = ({ onSaveWorkspace, onLoadWorkspace, onNewWorkspace, currentWorkspace }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [saveWorkspaceDialogOpen, setSaveWorkspaceDialogOpen] = useState(false);
    const [loadWorkspaceDialogOpen, setLoadWorkspaceDialogOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [savedWorkspaces, setSavedWorkspaces] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
        setSavedWorkspaces(workspaces);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNewWorkspace = () => {
        onNewWorkspace();
        handleClose();
    };

    const handleSaveWorkspace = () => {
        setSaveWorkspaceDialogOpen(true);
        handleClose();
    };

    const handleLoadWorkspace = () => {
        setLoadWorkspaceDialogOpen(true);
        handleClose();
    };

    const handleSaveWorkspaceConfirm = () => {
        onSaveWorkspace(workspaceName);
        setSaveWorkspaceDialogOpen(false);
        setWorkspaceName('');
        updateSavedWorkspaces();
    };

    const handleLoadWorkspaceConfirm = (workspace) => {
        onLoadWorkspace(workspace);
        setLoadWorkspaceDialogOpen(false);
    };

    const handleDeleteWorkspace = (index) => {
        const updatedWorkspaces = savedWorkspaces.filter((_, i) => i !== index);
        localStorage.setItem('workspaces', JSON.stringify(updatedWorkspaces));
        setSavedWorkspaces(updatedWorkspaces);
    };

    const updateSavedWorkspaces = () => {
        const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
        setSavedWorkspaces(workspaces);
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Workspace Options">
                <Button
                    variant="contained"
                    onClick={handleClick}
                    startIcon={<FolderOpenIcon />}
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                >
                    Workspace
                </Button>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleNewWorkspace}>
                    <AddIcon sx={{ mr: 1 }} /> New Workspace
                </MenuItem>
                <MenuItem onClick={handleSaveWorkspace}>
                    <SaveIcon sx={{ mr: 1 }} /> Save Workspace
                </MenuItem>
                <MenuItem onClick={handleLoadWorkspace}>
                    <FolderOpenIcon sx={{ mr: 1 }} /> Load Workspace
                </MenuItem>
            </Menu>

            {/* Save Workspace Dialog */}
            <Dialog open={saveWorkspaceDialogOpen} onClose={() => setSaveWorkspaceDialogOpen(false)}>
                <DialogTitle>Save Workspace</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Workspace Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveWorkspaceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveWorkspaceConfirm} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Load Workspace Dialog */}
            <Dialog 
                open={loadWorkspaceDialogOpen} 
                onClose={() => setLoadWorkspaceDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Load Workspace</Typography>
                        <Tooltip title={editMode ? "View Mode" : "Edit Mode"}>
                            <IconButton onClick={toggleEditMode}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {savedWorkspaces.map((workspace, index) => (
                            <React.Fragment key={index}>
                                <ListItem 
                                    secondaryAction={
                                        editMode && (
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkspace(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )
                                    }
                                >
                                    <ListItemText 
                                        primary={workspace.name} 
                                        onClick={() => !editMode && handleLoadWorkspaceConfirm(workspace)}
                                        sx={{ 
                                            cursor: editMode ? 'default' : 'pointer',
                                            '&:hover': {
                                                backgroundColor: editMode ? 'transparent' : theme.palette.action.hover,
                                            },
                                        }}
                                    />
                                </ListItem>
                                {index < savedWorkspaces.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                    {savedWorkspaces.length === 0 && (
                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, fontStyle: 'italic' }}>
                            No saved workspaces yet.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoadWorkspaceDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

WorkspaceManager.propTypes = {
    onSaveWorkspace: PropTypes.func.isRequired,
    onLoadWorkspace: PropTypes.func.isRequired,
    onNewWorkspace: PropTypes.func.isRequired,
    currentWorkspace: PropTypes.string,
};

export default WorkspaceManager;
