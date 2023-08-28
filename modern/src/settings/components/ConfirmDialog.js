import React from 'react';
import {Button, Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Alert} from '@mui/material';

const ConfirmDialog = (props) => {
  const { children, open, setOpen, onConfirm } = props;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog"><Alert severity="warning">Warning: You will delete all the selected rows, And you cannot reset them after the deletion.</Alert>
</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{p: "16px 24px"}}>
        <Button
          variant="outlined"
          onClick={() => setOpen(false)}
          color="positive"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="negative"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ConfirmDialog;