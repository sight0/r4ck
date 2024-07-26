import { useState, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const RackVisualization = () => {
    const [components, setComponents] = useState([]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const component = JSON.parse(e.dataTransfer.getData('component'));

        setComponents(prevComponents => [
            ...prevComponents,
            {
                ...component,
                x: point.x,
                y: point.y,
                id: prevComponents.length,
            }
        ]);
    }, []);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="rack-visualization"
        >
            <Stage width={window.innerWidth * 0.8} height={window.innerHeight}>
                <Layer>
                    {components.map((comp) => (
                        <Rect
                            key={comp.id}
                            x={comp.x}
                            y={comp.y}
                            width={100}
                            height={50}
                            fill="#ff7043" // Orange
                            stroke="#e64a19" // Darker Orange
                            strokeWidth={2}
                            draggable
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
}

export default RackVisualization;
