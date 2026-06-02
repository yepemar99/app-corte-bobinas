import { CircularProgress, Typography, Box } from '@mui/material';
import Modal from '../../../components/common/Modal';
import React from 'react';

const LoadingModal = ({ open = false, handleClose = () => {} }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Imprimiendo etiquetas, por favor espere...
        </Typography>
        <CircularProgress />
      </Box>
    </Modal>
  );
};

export default LoadingModal;
