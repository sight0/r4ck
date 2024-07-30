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
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                height: '100%',
                padding: '20px',
                color: 'white',
            }}
        >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                IDF {currentIdf}
            </Typography>
            <TextField 
                placeholder="Search components" 
                fullWidth 
                sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: 'white',
                        },
                    },
                    '& .MuiInputBase-input': {
                        color: 'white',
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
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                transform: 'translateY(-2px)',
                            },
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <DragIndicatorIcon sx={{ mr: 1 }} />
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
