export const componentTypeMap = {
  'access_point': 'AP',
  'ip_phone': 'IP',
  'end_user_device': 'EU',
  'switch': 'SW',
  'router': 'RT',
  'server': 'SR',
  'firewall': 'FW',
  'patch_panel': 'PP',
  'fiber_patch_panel': 'FP',
  'ups': 'UP',
  'cable_manager': 'CM',
  'other': 'OT'
};

export const generateSmartIdentifier = (componentType, idfNumber, sequence, portNumber) => {
  let prefix = isEndUserDeviceType(componentType) ? 'A' : 'B';
  let typeCode = componentTypeMap[componentType] || 'OT'; // OT for Other
  const idf = idfNumber.toString().padStart(2, '0');
  const device = sequence.toString().padStart(2, '0');
  const port = portNumber.toString().padStart(3, '0');
  if(componentType === 'MDF'){
    prefix = 'A';
    typeCode = 'DF';
  }else if(componentType === 'IDF'){
    prefix = 'B';
    typeCode = 'DF';
  }
  return `${prefix}${typeCode}-${idf}-${device}-${port}`;
};

export const isEndUserDeviceType = (type) => {
  return ['access_point', 'ip_phone', 'end_user_device'].includes(type);
};

let counter = 0;
export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${counter++}`;
};
