import React, { useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, 
  Button, Box, TextField, InputAdornment, Autocomplete
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PropTypes from 'prop-types';

const PatchingSchedule = ({ connections, components }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const getConnectionIdentifier = (componentId, portLabel) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return '';
    return `${component.name}-${portLabel}`;
  };
  console.log(connections)
  const allIdentifiers = useMemo(() => {
    return connections.flatMap(connection => [
      getConnectionIdentifier(connection.deviceA.deviceType, connection.deviceA.port),
      getConnectionIdentifier(connection.deviceB.deviceType, connection.deviceB.port)
    ]);
  }, [connections, components]);

  const filteredConnections = connections.filter(connection => 
    getConnectionIdentifier(connection.deviceA.deviceType, connection.deviceA.port).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getConnectionIdentifier(connection.deviceB.deviceType, connection.deviceB.port).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    // Implement CSV export logic here
    console.log('Exporting to CSV...');
  };

  const handleExportPDF = () => {
    // Implement PDF export logic here
    console.log('Exporting to PDF...');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Patching Schedule
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GetAppIcon />}
            onClick={handleExportCSV}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </Box>
      </Box>
      <Autocomplete
        freeSolo
        options={allIdentifiers}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            placeholder="Search connections..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
        onInputChange={(event, newValue) => {
          setSearchTerm(newValue);
        }}
        sx={{ mb: 2 }}
      />
      <TableContainer>
        <Table size="small" aria-label="patching schedule">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>From Device</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>From Port</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>From Port Identifier</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To Device</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To Port</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To Port Identifier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConnections.map((connection, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{connection.deviceA.deviceType}</TableCell>
                <TableCell>{connection.deviceA.port}</TableCell>
                <TableCell>{connection.deviceA.identifier}</TableCell>
                <TableCell>{connection.deviceB.deviceType}</TableCell>
                <TableCell>{connection.deviceB.port}</TableCell>
                <TableCell>{connection.deviceB.identifier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {filteredConnections.length === 0 && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}>
          No connections found matching your search criteria.
        </Typography>
      )}
    </Paper>
  );
};

PatchingSchedule.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.shape({
    deviceA: PropTypes.shape({
      componentId: PropTypes.number.isRequired,
      deviceType: PropTypes.string.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
    deviceB: PropTypes.shape({
      componentId: PropTypes.number.isRequired,
      deviceType: PropTypes.string.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  components: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

export default PatchingSchedule;
