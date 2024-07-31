import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const PatchSchedule = ({ connections }) => {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" gutterBottom component="div" style={{ padding: '16px' }}>
        Patch Schedule
      </Typography>
      <Table size="small" aria-label="patch schedule">
        <TableHead>
          <TableRow>
            <TableCell>From Device</TableCell>
            <TableCell>From Port</TableCell>
            <TableCell>To Device</TableCell>
            <TableCell>To Port</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {connections.map((connection, index) => (
            <TableRow key={index}>
              <TableCell>{connection.fromDevice}</TableCell>
              <TableCell>{connection.fromPort}</TableCell>
              <TableCell>{connection.toDevice}</TableCell>
              <TableCell>{connection.toPort}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PatchSchedule;
