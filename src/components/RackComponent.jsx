import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PanToolIcon from '@mui/icons-material/PanTool';

const RackComponent = ({ component, rackWidth, onDelete, onEdit, onDragStart, isDragging, componentColors, isHighlighted, sequence }) => {
    const isCableManager = component.type === 'cable_manager';
    const componentHeight = isCableManager ? 20 : component.units * 20; // Cable manager is always 1U (20px)

    return (
        <g 
            transform={`translate(${component.x}, ${component.y})`}
        >
            <rect
                width={rackWidth - 40}
                height={componentHeight}
                fill={isDragging ? "rgba(66, 165, 245, 0.5)" : componentColors[component.type] || componentColors.other}
                stroke={isHighlighted ? "#000000" : componentColors[component.type] || componentColors.other}
                strokeWidth={isHighlighted ? 7 : 1}
                rx="5"
                ry="5"
            />
            <text x="25" y={componentHeight / 2} fill="white" fontSize="12" dy=".35em">
                <tspan fontWeight="bold">{component.type.charAt(0).toUpperCase() + component.type.slice(1).replace('_', ' ')}</tspan>
                {!isCableManager && (
                    <tspan dx="5">{component.sequence}</tspan>
                )}
                {!isCableManager && (
                    <tspan dx="5" fontStyle="italic">({component.name})</tspan>
                )}
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
            {!isCableManager && (
                <foreignObject x={rackWidth - 100} y='-4' width="30" height="30">
                    <IconButton onClick={() => onEdit(component)} size="small">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </foreignObject>
            )}
            <foreignObject x={isCableManager ? rackWidth - 70 : rackWidth - 70} y='-4' width="30" height="30">
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
