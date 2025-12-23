import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { Package } from '../../../types';

interface DeleteDialogProps {
  open: boolean;
  packageToDelete: Package | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteDialog = ({
  open,
  packageToDelete,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
          }}
        >
          Remover Pacote
        </Typography>
        <IconButton onClick={onCancel} size="small" disabled={isDeleting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            mb: 1,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Tem certeza que deseja remover o pacote{' '}
          <strong>{packageToDelete?.description || packageToDelete?.trackingCode}</strong>?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Esta ação não pode ser desfeita.
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Button
          onClick={onCancel}
          disabled={isDeleting}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 100,
          }}
          startIcon={
            isDeleting ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : null
          }
        >
          {isDeleting ? 'Removendo...' : 'Remover'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
