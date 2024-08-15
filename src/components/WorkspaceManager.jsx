import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { 
    Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, List, ListItem, ListItemText, IconButton, Typography, Box,
    Tooltip, Divider, useTheme, Fade, Zoom, CircularProgress
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { setCookie, getCookie } from '../utils/cookieUtils';

const WorkspaceManager = forwardRef(({ onSaveWorkspace, onLoadWorkspace, onNewWorkspace, currentWorkspace, hasUnsavedChanges }, ref) => {
    const forceRefresh = useCallback(() => {
        setCookie('lastSavedWorkspace', currentWorkspace, 1);
        window.location.reload();
    }, [currentWorkspace]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [saveWorkspaceDialogOpen, setSaveWorkspaceDialogOpen] = useState(false);
    const [loadWorkspaceDialogOpen, setLoadWorkspaceDialogOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [savedWorkspaces, setSavedWorkspaces] = useState([]);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [workspaceToDelete, setWorkspaceToDelete] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        updateSavedWorkspaces();
        const lastSavedWorkspace = getCookie('lastSavedWorkspace');
        if (lastSavedWorkspace) {
            onLoadWorkspace({ name: lastSavedWorkspace });
            setCookie('lastSavedWorkspace', '', -1); // Clear the cookie
        }
    }, [onLoadWorkspace]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNewWorkspace = useCallback(() => {
        onNewWorkspace();
        handleClose();
    }, [onNewWorkspace]);

    const handleSaveWorkspace = useCallback(() => {
        console.log('WorkspaceManager: handleSaveWorkspace called');
        console.log('Current workspace:', currentWorkspace);
        console.log('Has unsaved changes:', hasUnsavedChanges);
        setIsSaving(true);
        if (currentWorkspace) {
            console.log('Saving existing workspace:', currentWorkspace);
            onSaveWorkspace(currentWorkspace).then(() => {
                // Keep the loading state, as we're about to refresh
                forceRefresh();
            });
        } else {
            console.log('Opening save workspace dialog');
            setSaveWorkspaceDialogOpen(true);
            setIsSaving(false);
        }
        // Force update of UI
        setAnchorEl(null);
        console.log('WorkspaceManager: handleSaveWorkspace completed');
    }, [currentWorkspace, onSaveWorkspace, hasUnsavedChanges, forceRefresh]);

    const handleLoadWorkspace = useCallback(() => {
        setLoadWorkspaceDialogOpen(true);
        handleClose();
    }, []);

    const handleSaveWorkspaceConfirm = useCallback(() => {
        setIsSaving(true);
        onSaveWorkspace(workspaceName).then(() => {
            setIsSaving(false);
            setShowSaved(true);
            setTimeout(() => {
                setShowSaved(false);
                setSaveWorkspaceDialogOpen(false);
                setWorkspaceName('');
                updateSavedWorkspaces();
                forceRefresh();
            }, 2000);
        });
    }, [workspaceName, onSaveWorkspace, forceRefresh]);

    const handleLoadWorkspaceConfirm = useCallback(async (workspace) => {
        if (workspace && typeof workspace === 'object') {
            try {
                const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
                const fullWorkspace = workspaces.find(w => w.name === workspace.name);
                if (fullWorkspace && fullWorkspace.data) {
                    await onLoadWorkspace(fullWorkspace);
                } else {
                    console.error('Workspace data not found:', workspace.name);
                    // Optionally, show an error message to the user
                }
            } catch (error) {
                console.error('Error loading workspace:', error);
                // Optionally, show an error message to the user
            }
        } else {
            console.error('Invalid workspace object:', workspace);
            // Optionally, show an error message to the user
        }
        setLoadWorkspaceDialogOpen(false);
    }, [onLoadWorkspace]);

    const handleDeleteWorkspace = useCallback((workspace) => {
        setWorkspaceToDelete(workspace);
        setDeleteConfirmOpen(true);
    }, []);

    const confirmDeleteWorkspace = useCallback(() => {
        const updatedWorkspaces = savedWorkspaces.filter(w => w.name !== workspaceToDelete.name);
        localStorage.setItem('workspaces', JSON.stringify(updatedWorkspaces));
        setSavedWorkspaces(updatedWorkspaces);
        setDeleteConfirmOpen(false);
        setWorkspaceToDelete(null);
    }, [savedWorkspaces, workspaceToDelete]);

    const updateSavedWorkspaces = useCallback(() => {
        const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
        setSavedWorkspaces(workspaces);
    }, []);

    useImperativeHandle(ref, () => ({
        openSaveDialog: () => {
            setSaveWorkspaceDialogOpen(true);
        }
    }));

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={hasUnsavedChanges ? "Save changes" : "No unsaved changes"}>
                <span>
                    <Zoom in={true}>
                        <Button
                            variant="contained"
                            onClick={handleSaveWorkspace}
                            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : showSaved ? <CheckCircleIcon /> : <SaveIcon />}
                            disabled={isSaving}
                            // sx={{ mr: 1, bgcolor: '#9f97eb', '&:hover': { bgcolor: '#9f97eb' } }}
                            sx={{
                                backgroundColor: hasUnsavedChanges ? '#ca4a4a' : '#aad523',
                                color: theme.palette.primary.contrastText,
                                '&:hover': {
                                    backgroundColor: hasUnsavedChanges ? theme.palette.error.dark : theme.palette.primary.dark,
                                },
                                transition: 'background-color 0.3s',
                            }}
                        >
                            {isSaving ? 'Saving...' : showSaved ? 'SAVED!' : 'Save'}
                        </Button>
                    </Zoom>
                </span>
            </Tooltip>
            <Button
                variant="contained"
                onClick={handleClick}
                startIcon={<FolderOpenIcon />}
                sx={{
                    backgroundColor: '#f8f4f4',
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                }}
            >
                Workspace
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
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
                <DialogTitle>Load Workspace</DialogTitle>
                <DialogContent>
                    <List>
                        {savedWorkspaces.map((workspace, index) => (
                            <Fade in={true} key={workspace.name}>
                                <ListItem 
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkspace(workspace)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText 
                                        primary={workspace.name} 
                                        onClick={() => handleLoadWorkspaceConfirm(workspace)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                            },
                                        }}
                                    />
                                </ListItem>
                            </Fade>
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                        Confirm Deletion
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the workspace "{workspaceToDelete?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDeleteWorkspace} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

WorkspaceManager.propTypes = {
    onSaveWorkspace: PropTypes.func.isRequired,
    onLoadWorkspace: PropTypes.func.isRequired,
    onNewWorkspace: PropTypes.func.isRequired,
    currentWorkspace: PropTypes.string,
    hasUnsavedChanges: PropTypes.bool.isRequired,
};

export default WorkspaceManager;
