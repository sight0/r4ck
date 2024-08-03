import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const IssuesPanel = ({ issues }) => {
  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Issues and Requirements</Typography>
      <List>
        {issues.map((issue, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {issue.isSatisfied ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="error" />}
            </ListItemIcon>
            <ListItemText primary={issue.message} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default IssuesPanel;
