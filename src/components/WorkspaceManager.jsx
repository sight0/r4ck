import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';

const WorkspaceManager = ({ onSaveWorkspace, onLoadWorkspace, onNewWorkspace }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [saveWorkspaceDialogOpen, setSaveWorkspaceDialogOpen] = useState(false);
    const [loadWorkspaceDialogOpen, setLoadWorkspaceDialogOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [savedWorkspaces, setSavedWorkspaces] = useState(JSON.parse(localStorage.getItem('workspaces') || '[]'));

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
        setSavedWorkspaces(JSON.parse(localStorage.getItem('workspaces') || '[]'));
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

    return (
        <>
            <Button
                variant="contained"
                onClick={handleClick}
                startIcon={<FolderOpenIcon />}
            >
                Workspace
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleNewWorkspace}>New Workspace</MenuItem>
                <MenuItem onClick={handleSaveWorkspace}>Save Workspace</MenuItem>
                <MenuItem onClick={handleLoadWorkspace}>Load Workspace</MenuItem>
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
                        variant="standard"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveWorkspaceDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveWorkspaceConfirm}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Load Workspace Dialog */}
            <Dialog open={loadWorkspaceDialogOpen} onClose={() => setLoadWorkspaceDialogOpen(false)}>
                <DialogTitle>Load Workspace</DialogTitle>
                <DialogContent>
                    <List>
                        {savedWorkspaces.map((workspace, index) => (
                            <ListItem key={index} secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkspace(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemText 
                                    primary={workspace.name} 
                                    onClick={() => handleLoadWorkspaceConfirm(workspace)}
                                    style={{cursor: 'pointer'}}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoadWorkspaceDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

WorkspaceManager.propTypes = {
    onSaveWorkspace: PropTypes.func.isRequired,
    onLoadWorkspace: PropTypes.func.isRequired,
    onNewWorkspace: PropTypes.func.isRequired,
};

export default WorkspaceManager;
