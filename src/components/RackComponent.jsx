import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PanToolIcon from '@mui/icons-material/PanTool';

const RackComponent = ({ component, rackWidth, onDelete, onEdit, onDragStart, isDragging, componentColors, isHighlighted, sequence }) => {
    return (
        <g 
            transform={`translate(${component.x}, ${component.y})`}
        >
            <rect
                width={rackWidth - 40}
                height={component.units * 20}
                fill={isDragging ? "rgba(66, 165, 245, 0.5)" : componentColors[component.type] || componentColors.other}
                stroke={isHighlighted ? "#000000" : componentColors[component.type] || componentColors.other}
                strokeWidth={isHighlighted ? 7 : 1}
                rx="5"
                ry="5"
            />
            <text x={(rackWidth - 40) / 2} y={(component.units * 20) / 2} textAnchor="middle" fill="white" fontSize="12" dy=".3em">
                {component.type.charAt(0).toUpperCase() + component.type.slice(1).replace('_', ' ')} ({component.capacity})
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
    componentColors: PropTypes.object.isRequired,
    isHighlighted: PropTypes.bool,
    sequence: PropTypes.number,
};

export default RackComponent;
