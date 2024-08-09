import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, 
  Button, Box, TextField, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import PropTypes from 'prop-types';

const PatchingSchedule = ({ connections, components }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const getPortIdentifier = (componentId, portLabel) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return '';
    return `${component.name}-${portLabel}`;
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedConnections = [...connections].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a.deviceA[sortColumn] || a.deviceB[sortColumn];
    const bValue = b.deviceA[sortColumn] || b.deviceB[sortColumn];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredConnections = sortedConnections.filter(connection => 
    connection.deviceA.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.deviceB.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.deviceA.port.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.deviceB.port.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Implement CSV export logic here
    console.log('Exporting to CSV...');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Patching Schedule
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GetAppIcon />}
          onClick={handleExport}
        >
          Export to CSV
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Sort and filter options">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table size="small" aria-label="patching schedule">
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                From Device {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('port')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                From Port {sortColumn === 'port' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>From Port Identifier</TableCell>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                To Device {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell onClick={() => handleSort('port')} sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                To Port {sortColumn === 'port' && (sortDirection === 'asc' ? '▲' : '▼')}
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To Port Identifier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConnections.map((connection, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                <TableCell>{connection.deviceA.name}</TableCell>
                <TableCell>{connection.deviceA.port}</TableCell>
                <TableCell>{getPortIdentifier(connection.deviceA.componentId, connection.deviceA.port)}</TableCell>
                <TableCell>{connection.deviceB.name}</TableCell>
                <TableCell>{connection.deviceB.port}</TableCell>
                <TableCell>{getPortIdentifier(connection.deviceB.componentId, connection.deviceB.port)}</TableCell>
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
      name: PropTypes.string.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
    deviceB: PropTypes.shape({
      componentId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  components: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

export default PatchingSchedule;
