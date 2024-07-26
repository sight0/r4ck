import React, { useCallback } from 'react';
import { List, ListItem, TextField, Typography } from '@mui/material';

const components = [
    { id: 1, name: 'Rack', type: 'rack' },
    { id: 2, name: 'Switch', type: 'switch' },
];

const Sidebar = ({ currentIdf }) => {
    const handleDragStart = useCallback((e, component) => {
        e.dataTransfer.setData('component', JSON.stringify(component));
    }, []);

    return (
        <aside className="sidebar">
            <Typography variant="h6" sx={{ m: 2 }}>IDF {currentIdf}</Typography>
            <TextField placeholder="Search components" fullWidth sx={{ m: 2 }} />
            <List>
                {components.map(component => (
                    <ListItem
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        className="sidebar-item"
                        sx={{ cursor: 'move' }}
                    >
                        {component.name}
                    </ListItem>
                ))}
            </List>
        </aside>
    );
}

export default Sidebar;
