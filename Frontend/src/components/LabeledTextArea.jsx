import React from 'react';
import { Box, Typography } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { styled, useTheme } from '@mui/material/styles'

const LabeledTextarea = ({ label, labelBoldness=500, value, onChange, placeholder, minRows=5}) => {
  const theme = useTheme()

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle1" sx={{fontWeight: labelBoldness, mb: 1 }}>
        {label}
      </Typography>

      <TextareaAutosize
        minRows={minRows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: `2px solid ${theme.palette.divider}`,
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.mode === 'dark'
          ? theme.palette.grey[900]
          : theme.palette.grey[10],
          color: theme.palette.text.primary
        }}
      />
    </Box>
  );
};

export default LabeledTextarea;
