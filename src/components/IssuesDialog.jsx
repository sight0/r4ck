import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

const IssueBlock = ({ issue }) => (
  <Box
    sx={{
      backgroundColor: issue.isSatisfied ? '#f0f0f0' : '#e0e0e0',
      borderRadius: 2,
      p: 2,
      mb: 2,
      boxShadow: 1,
      border: `1px solid ${issue.isSatisfied ? '#d0d0d0' : '#c0c0c0'}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {issue.isSatisfied ? (
        <CheckCircleOutlineIcon sx={{ mr: 1, color: '#4a4a4a' }} />
      ) : (
        <ErrorOutlineIcon sx={{ mr: 1, color: '#DAA520' }} />
      )}
      <Typography variant="h6" color={issue.isSatisfied ? '#4a4a4a' : '#DAA520'}>
        {issue.isSatisfied ? 'Requirement Satisfied' : `${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Priority Issue`}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ mb: 1, color: '#333' }}>{issue.message}</Typography>
    {!issue.isSatisfied && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, backgroundColor: 'rgba(218, 165, 32, 0.1)', p: 1, borderRadius: 1 }}>
        <LightbulbOutlinedIcon sx={{ mr: 1, color: '#DAA520' }} />
        <Typography variant="body2" color="#4a4a4a">
          <strong>Solution Hint:</strong> {issue.solutionHint || "Review the requirement and adjust your rack design accordingly."}
        </Typography>
      </Box>
    )}
  </Box>
);

const IssuesDialog = ({ open, onClose, issues }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h5" component="div" color="#333">
          Rack Design Issues and Requirements
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Box sx={{ mt: 2 }}>
          {issues.map((issue, index) => (
            <IssueBlock key={index} issue={issue} />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ color: '#DAA520', '&:hover': { backgroundColor: 'rgba(218, 165, 32, 0.1)' } }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IssuesDialog;
