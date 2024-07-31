import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PanToolIcon from '@mui/icons-material/PanTool';

const componentColors = {
    switch: '#4CAF50',  // Green
    fiber_switch: '#2196F3',  // Blue
    patchPanel: '#9C27B0',  // Purple
    firewall: '#F44336',  // Red
    ups: '#FFC107',  // Amber
    server: '#00BCD4',  // Cyan
    rack: '#795548',  // Brown
    other: '#607D8B',  // Blue Grey
};

const RackComponent = ({ component, rackWidth, onDelete, onEdit, onDragStart, isDragging }) => {
    return (
        <g 
            transform={`translate(${component.x}, ${component.y})`}
        >
            <rect
                width={rackWidth - 40}
                height={component.units * 20}
                fill={isDragging ? "rgba(66, 165, 245, 0.5)" : componentColors[component.type] || componentColors.other}
                stroke={componentColors[component.type] || componentColors.other}
                rx="5"
                ry="5"
            />
            <text x={(rackWidth - 40) / 2} y={(component.units * 20) / 2} textAnchor="middle" fill="white" fontSize="12" dy=".3em">
                {component.name} ({component.capacity})
            </text>
            <foreignObject x="0" y='-4' width="30" height="30">
                <IconButton 
                    onMouseDown={(e) => onDragStart(e)} 
                    size="small"
                    style={{ cursor: 'move' }}
                >
                    <PanToolIcon fontSize="small" />
                </IconButton>
            </foreignObject>
            <foreignObject x={rackWidth - 100} y='-4' width="30" height="30">
                <IconButton onClick={() => onEdit(component)} size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            </foreignObject>
            <foreignObject x={rackWidth - 70} y='-4' width="30" height="30">
                <IconButton onClick={() => onDelete(component.id)} size="small">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </foreignObject>
        </g>
    );
};

RackComponent.propTypes = {
    component: PropTypes.shape({
        id: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        capacity: PropTypes.string.isRequired,
        units: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
    rackWidth: PropTypes.number.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    isDragging: PropTypes.bool,
};

export default RackComponent;
