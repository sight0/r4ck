export const calculateInterIdfConnections = (components, currentIdf) => {
    const connections = {};
    components.forEach(component => {
        if (component.type === 'patch_panel' && component.ports) {
            component.ports.forEach(port => {
                if (port.cableSource && (port.cableSource.startsWith('IDF_') || port.cableSource === 'MDF')) {
                    if (!connections[currentIdf]) {
                        connections[currentIdf] = {};
                    }
                    if (!connections[currentIdf][port.cableSource]) {
                        connections[currentIdf][port.cableSource] = 0;
                    }
                    connections[currentIdf][port.cableSource]++;

                    const targetIdf = port.cableSource === 'MDF' ? 'MDF' : parseInt(port.cableSource.split('_')[1]);
                    if (!connections[targetIdf]) {
                        connections[targetIdf] = {};
                    }
                    if (!connections[targetIdf][`IDF_${currentIdf}`]) {
                        connections[targetIdf][`IDF_${currentIdf}`] = 0;
                    }
                    connections[targetIdf][`IDF_${currentIdf}`]++;
                }
            });
        }
    });
    return connections;
};
