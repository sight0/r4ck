import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';

const WorkspaceManager = ({ onSaveWorkspace, onLoadWorkspace, onNewWorkspace }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [loadDialogOpen, setLoadDialogOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
        const savedWorkspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
        setWorkspaces(savedWorkspaces);
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSaveWorkspace = () => {
        setSaveDialogOpen(true);
        handleClose();
    };

    const handleLoadWorkspace = () => {
        setLoadDialogOpen(true);
        handleClose();
    };

    const handleNewWorkspace = () => {
        onNewWorkspace();
        handleClose();
    };

    const handleSaveConfirm = () => {
        onSaveWorkspace(workspaceName);
        setSaveDialogOpen(false);
        setWorkspaceName('');
    };

    const handleLoadConfirm = (workspace) => {
        onLoadWorkspace(workspace);
        setLoadDialogOpen(false);
    };

    const handleDeleteWorkspace = (index) => {
        const newWorkspaces = workspaces.filter((_, i) => i !== index);
        localStorage.setItem('workspaces', JSON.stringify(newWorkspaces));
        setWorkspaces(newWorkspaces);
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
            <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
                <DialogTitle>Save Workspace</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Workspace Name"
                        type="text"
                        fullWidth
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveConfirm}>Save</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)}>
                <DialogTitle>Load Workspace</DialogTitle>
                <DialogContent>
                    <List>
                        {workspaces.map((workspace, index) => (
                            <ListItem key={index} secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWorkspace(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemText 
                                    primary={workspace.name} 
                                    onClick={() => handleLoadConfirm(workspace)}
                                    style={{cursor: 'pointer'}}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WorkspaceManager;
