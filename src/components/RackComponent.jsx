import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const RackComponent = ({ component, rackWidth, onDelete, onDrag }) => {
    return (
        <g 
            transform={`translate(${component.x}, ${component.y})`}
            draggable="true"
            onDrag={onDrag}
        >
            <rect
                width={rackWidth - 20}
                height={component.units * 20}
                fill="#42a5f5"
                stroke="#1e88e5"
                rx="5"
                ry="5"
            />
            <text x={(rackWidth - 20) / 2} y={(component.units * 20) / 2} textAnchor="middle" fill="white" fontSize="12" dy=".3em">
                {component.name} ({component.capacity})
            </text>
            <foreignObject x={rackWidth - 50} y='-4'  width="30" height="30">
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
    }).isRequired,
    rackWidth: PropTypes.number.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
};

export default RackComponent;
