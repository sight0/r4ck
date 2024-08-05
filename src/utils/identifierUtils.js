export const componentTypeMap = {
  'access_point': 'AP',
  'ip_phone': 'IP',
  'end_user_device': 'EU',
  'switch': 'SW',
  'router': 'RT',
  'server': 'SR',
  'firewall': 'FW',
  'patch_panel': 'PP',
  // Add more as needed
};

export const generateSmartIdentifier = (componentType, idfNumber, sequence, portNumber) => {
  const prefix = isEndUserDeviceType(componentType) ? 'A' : 'B';
  const typeCode = componentTypeMap[componentType] || 'OT'; // OT for Other
  const idf = idfNumber.toString().padStart(2, '0');
  const device = sequence.toString().padStart(2, '0');
  const port = portNumber.toString().padStart(3, '0');

  return `${prefix}${typeCode}-${idf}-${device}-${port}`;
};

export const isEndUserDeviceType = (type) => {
  return ['access_point', 'ip_phone', 'end_user_device'].includes(type);
};
