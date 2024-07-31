import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { List, ListItem, TextField, Typography, Box, Paper } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const components = [
    { id: 1, name: 'Rack', type: 'rack' },
    { id: 2, name: 'Switch', type: 'switch' },
];

const Sidebar = ({ currentIdf }) => {
    const handleDragStart = useCallback((e, component) => {
        e.dataTransfer.setData('component', JSON.stringify(component));
    }, []);

    return (
        <Paper 
            elevation={3}
            className="sidebar"
            sx={{
                background: '#f5f5f5',
                height: '100%',
                padding: '20px',
                color: '#333',
            }}
        >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a' }}>
                Components List
            </Typography>
            <TextField 
                placeholder="Search components" 
                fullWidth 
                sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#bdbdbd',
                        },
                        '&:hover fieldset': {
                            borderColor: '#9e9e9e',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#757575',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: '#333',
                    },
                }} 
            />
            <List>
                {components.map(component => (
                    <ListItem
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        sx={{ 
                            cursor: 'move',
                            mb: 2,
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            },
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <DragIndicatorIcon sx={{ mr: 1, color: '#757575' }} />
                        {component.name}
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}

Sidebar.propTypes = {
    currentIdf: PropTypes.number.isRequired,
};

export default Sidebar;
