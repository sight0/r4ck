import {useMemo, useState} from 'react';
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import {saveAs} from 'file-saver';

const PatchingSchedule = ({ connections, currentIdf }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  connections.filter(connection => {console.log(connection)});

  const allIdentifiers = useMemo(() => {
    return connections.flatMap(connection => [
      connection.deviceA.identifier,
      connection.deviceB.identifier,
    ])
  }, [connections]);

  const filteredConnections = connections.filter(connection =>
    connection.deviceA.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.deviceB.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['From Device', 'From Port', 'From Port Identifier', 'To Device', 'To Port', 'To Port Identifier'];
    const csvContent = [
      headers.join(','),
      ...filteredConnections.map(connection => [
        connection.deviceA.deviceType + " " + connection.deviceA.deviceSequence,
        connection.deviceA.port,
        connection.deviceA.identifier,
        connection.deviceB.deviceType + " " + connection.deviceB.deviceSequence,
        connection.deviceB.port,
        connection.deviceB.identifier
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'patching_schedule.csv');
    setSnackbarMessage('CSV exported successfully!');
    setSnackbarOpen(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Patching Schedule', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    doc.autoTable({
      head: [['From Device', 'From Port', 'From Port Identifier', 'To Device', 'To Port', 'To Port Identifier']],
      body: filteredConnections.map(connection => [
        connection.deviceA.deviceType + " " + connection.deviceA.deviceSequence,
        connection.deviceA.port,
        connection.deviceA.identifier,
        connection.deviceB.deviceType + " " + connection.deviceB.deviceSequence,
        connection.deviceB.port,
        connection.deviceB.identifier
      ]),
      startY: 30,
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [242, 242, 242] },
      margin: { top: 30 },
    });
    const pdfName = `patching_schedule_IDF${currentIdf}.pdf`
    doc.save(pdfName);
    setSnackbarMessage('PDF exported successfully!');
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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
            placeholder="Search identifiers..."
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
        renderOption={(props, option) => (
          <li {...props} key={option}>
            {option}
          </li>
        )}
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
                <TableCell>{connection.deviceA.deviceType} {connection.deviceA.deviceSequence}</TableCell>
                <TableCell>{connection.deviceA.port}</TableCell>
                <TableCell>{connection.deviceA.identifier}</TableCell>
                <TableCell>{connection.deviceB.deviceType} {connection.deviceB.deviceSequence}</TableCell>
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
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Paper>
  );
};

PatchingSchedule.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.shape({
    deviceA: PropTypes.shape({
      componentId: PropTypes.number.isRequired,
      deviceType: PropTypes.string.isRequired,
      deviceSequence: PropTypes.number.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
    deviceB: PropTypes.shape({
      componentId: PropTypes.number.isRequired,
      deviceType: PropTypes.string.isRequired,
      deviceSequence: PropTypes.number.isRequired,
      port: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  components: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  currentIdf: PropTypes.number.isRequired,
};

export default PatchingSchedule;
