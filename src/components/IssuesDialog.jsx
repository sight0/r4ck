import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const IssuesDialog = ({ open, onClose, issues }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Issues and Requirements</DialogTitle>
      <DialogContent>
        <List>
          {issues.map((issue, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {issue.isSatisfied ? (
                  <CheckCircleOutlineIcon color="success" />
                ) : (
                  <ErrorOutlineIcon color={issue.severity === 'high' ? 'error' : 'warning'} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={issue.message}
                secondary={
                  <Typography variant="body2" color={issue.isSatisfied ? 'success.main' : (issue.severity === 'high' ? 'error.main' : 'warning.main')}>
                    {issue.isSatisfied ? 'Satisfied' : `${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Priority`}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssuesDialog;
