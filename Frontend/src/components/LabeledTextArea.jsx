import React from 'react';
import { Box, Typography } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';

const LabeledTextarea = ({ label, value, onChange, placeholder}) => {
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Typography variant="subtitle1" sx={{fontSize:18, fontWeight: 'bold', mb: 1 }}>
        {label}
      </Typography>

      <TextareaAutosize
        minRows={5}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontFamily: 'inherit',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
    </Box>
  );
};

export default LabeledTextarea;
