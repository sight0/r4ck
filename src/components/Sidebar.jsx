import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { List, ListItem, TextField, Typography, Box } from '@mui/material';

const components = [
    { id: 1, name: 'Rack', type: 'rack' },
    { id: 2, name: 'Switch', type: 'switch' },
];

const Sidebar = ({ currentIdf }) => {
    const handleDragStart = useCallback((e, component) => {
        e.dataTransfer.setData('component', JSON.stringify(component));
    }, []);

    return (
        <Box 
            className="sidebar"
            sx={{
                background: 'linear-gradient(to right, #f6f6f6, #ffffff)',
                height: '100%',
                padding: '20px',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            }}
        >
            <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
                IDF {currentIdf}
            </Typography>
            <TextField 
                placeholder="Search components" 
                fullWidth 
                sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#ccc',
                        },
                        '&:hover fieldset': {
                            borderColor: '#999',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#42a5f5',
                        },
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
                            mb: 1,
                            backgroundColor: '#fff',
                            borderRadius: '5px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#f0f7ff',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        {component.name}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

Sidebar.propTypes = {
    currentIdf: PropTypes.number.isRequired,
};

export default Sidebar;
