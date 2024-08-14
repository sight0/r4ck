import React from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

const WorkspaceManager = ({ onSaveWorkspace, onLoadWorkspace, onNewWorkspace }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

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
        onSaveWorkspace();
        handleClose();
    };

    const handleLoadWorkspace = () => {
        onLoadWorkspace();
        handleClose();
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
        </>
    );
};

WorkspaceManager.propTypes = {
    onSaveWorkspace: PropTypes.func.isRequired,
    onLoadWorkspace: PropTypes.func.isRequired,
    onNewWorkspace: PropTypes.func.isRequired,
};

export default WorkspaceManager;
