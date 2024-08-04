export const calculateInterIdfConnections = (components, currentIdf) => {
    const connections = {};
    components.forEach(component => {
        if (component.type === 'patch_panel' && component.ports) {
            component.ports.forEach(port => {
                if (port.cableSource.startsWith('IDF_') || port.cableSource === 'MDF') {
                    if (!connections[currentIdf]) {
                        connections[currentIdf] = [];
                    }
                    if (!connections[currentIdf].includes(port.cableSource)) {
                        connections[currentIdf].push(port.cableSource);
                    }

                    const targetIdf = port.cableSource === 'MDF' ? 'MDF' : parseInt(port.cableSource.split('_')[1]);
                    if (!connections[targetIdf]) {
                        connections[targetIdf] = [];
                    }
                    if (!connections[targetIdf].includes(`IDF_${currentIdf}`)) {
                        connections[targetIdf].push(`IDF_${currentIdf}`);
                    }
                }
            });
        }
    });
    return connections;
};
