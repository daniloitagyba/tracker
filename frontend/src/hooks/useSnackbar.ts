import { useState } from 'react';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const showInfo = (message: string) => {
    setSnackbar({ open: true, message, severity: 'info' });
  };

  const showWarning = (message: string) => {
    setSnackbar({ open: true, message, severity: 'warning' });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return {
    snackbar,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    closeSnackbar,
  };
};