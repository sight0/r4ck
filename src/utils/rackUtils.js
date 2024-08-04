export const calculateInterIdfConnections = (components, currentIdf) => {
    const connections = {};
    connections[currentIdf] = {};

    components.forEach(component => {
        if (component.type === 'patch_panel' && component.ports) {
            component.ports.forEach(port => {
                if (port.cableSource && (port.cableSource.startsWith('IDF_') || port.cableSource === 'MDF')) {
                    if (!connections[currentIdf][port.cableSource]) {
                        connections[currentIdf][port.cableSource] = 0;
                    }
                    connections[currentIdf][port.cableSource]++;
                }
            });
        }
    });
    return connections;
};
