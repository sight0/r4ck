import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const IssueBlock = ({ issue }) => (
  <Box
    sx={{
      backgroundColor: issue.isSatisfied ? '#e8f5e9' : '#fff3e0',
      borderRadius: 2,
      p: 2,
      mb: 2,
      boxShadow: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {issue.isSatisfied ? (
        <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
      ) : (
        <ErrorOutlineIcon color={issue.severity === 'high' ? 'error' : 'warning'} sx={{ mr: 1 }} />
      )}
      <Typography variant="h6" color={issue.isSatisfied ? 'success.main' : (issue.severity === 'high' ? 'error.main' : 'warning.main')}>
        {issue.isSatisfied ? 'Requirement Satisfied' : `${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Priority Issue`}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ mb: 1 }}>{issue.message}</Typography>
    {!issue.isSatisfied && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, backgroundColor: 'rgba(0, 0, 0, 0.04)', p: 1, borderRadius: 1 }}>
        <LightbulbOutlinedIcon sx={{ mr: 1, color: 'info.main' }} />
        <Typography variant="body2" color="text.secondary">
          <strong>Solution Hint:</strong> {issue.solutionHint || "Review the requirement and adjust your rack design accordingly."}
        </Typography>
      </Box>
    )}
  </Box>
);

const IssuesDialog = ({ open, onClose, issues }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Rack Design Issues and Requirements
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {issues.map((issue, index) => (
          <IssueBlock key={index} issue={issue} />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssuesDialog;
