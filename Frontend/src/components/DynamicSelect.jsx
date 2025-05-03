import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DynamicSelect = ({ label, options, value, onChange, onOptionsChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newOption, setNewOption] = useState('');

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => {
    setNewOption('');
    setOpenDialog(false);
  };

  const handleAdd = () => {
    const trimmed = newOption.trim();
    if (trimmed && !options.includes(trimmed)) {
      const updated = [...options, trimmed];
      onOptionsChange(updated);
      onChange({ target: { value: trimmed } });
    }
    handleDialogClose();
  };

  const handleDelete = (optToDelete) => {
    const filtered = options.filter((opt) => opt !== optToDelete);
    onOptionsChange(filtered);
    if (value === optToDelete) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <>
      <FormControl sx={{ flex: 1 }}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => {
            if (e.target.value === '__add_new__') {
              handleDialogOpen();
            } else {
              onChange(e);
            }
          }}
          renderValue={(selected) => selected || 'None'}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>

          {options.map((opt) => (
            <MenuItem key={opt} value={opt}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>{opt}</span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't close the menu
                    handleDelete(opt);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))}

          <MenuItem value="__add_new__" sx={{ fontStyle: 'italic', color: 'blue' }}>
            + Add New
          </MenuItem>
        </Select>
      </FormControl>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New {label}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={`New ${label}`}
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" disabled={!newOption.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DynamicSelect;
