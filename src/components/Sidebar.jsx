import React from 'react';
import { List, ListItem, TextField } from '@mui/material';

const components = [
    { id: 1, name: 'Rack' },
    { id: 2, name: 'Switch' },
    // Add more components as needed
];

function Sidebar() {
    const handleDragStart = (e, component) => {
        e.dataTransfer.setData('component', JSON.stringify(component));
    };

    return (
        <aside className="sidebar">
            <TextField placeholder="Search components" fullWidth />
            <List>
                {components.map(component => (
                    <ListItem
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        className="sidebar-item"
                    >
                        {component.name}
                    </ListItem>
                ))}
            </List>
        </aside>
    );
}

export default Sidebar;
