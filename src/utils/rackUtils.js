export const calculateInterIdfConnections = (components, currentIdf) => {
    console.log('calculateInterIdfConnections called with:', { components, currentIdf });
    const connections = {};

    components.forEach(component => {
        if (component.type === 'patch_panel' && component.ports) {
            component.ports.forEach(port => {
                if (port.cableSource && port.cableSource.startsWith('IDF_')) {
                    const targetIdf = port.cableSource;
                    if (!connections[targetIdf]) {
                        connections[targetIdf] = 0;
                    }
                    connections[targetIdf]++;
                }
            });
        }
    });

    console.log('Calculated connections:', connections);
    return connections;
};
