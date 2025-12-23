import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { TrackingTimeline } from '../TrackingTimeline';
import type { Package, PackageWithTracking } from '../../../types';

interface TrackingDialogProps {
  open: boolean;
  onClose: () => void;
  selectedPackage?: Package;
  trackingData?: PackageWithTracking;
  isLoading: boolean;
  onDelete?: (pkg: Package) => void;
}

export const TrackingDialog = ({
  open,
  onClose,
  selectedPackage,
  trackingData,
  isLoading,
  onDelete,
}: TrackingDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          backgroundColor: 'background.paper',
          ...(isMobile && {
            margin: 0,
            maxHeight: '100%',
          }),
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
          borderBottom: isMobile ? '1px solid' : 'none',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
          }}
        >
          Rastreamento
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedPackage && onDelete && (
            <IconButton
              onClick={() => onDelete(selectedPackage)}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'error.dark',
                  color: 'error.contrastText',
                },
                '&:active': {
                  transform: 'scale(0.9)',
                },
              }}
              aria-label="Remover pacote"
            >
              <DeleteRoundedIcon />
            </IconButton>
          )}
          <IconButton
            onClick={onClose}
            size={isMobile ? 'medium' : 'large'}
            sx={{
              '&:active': {
                transform: 'scale(0.9)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          '&.MuiDialogContent-root': {
            paddingTop: { xs: 2.5, sm: 3 },
          },
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              py: { xs: 6, sm: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress
              size={isMobile ? 40 : 48}
              thickness={4}
              sx={{ color: 'primary.main' }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Carregando rastreamento...
            </Typography>
          </Box>
        ) : trackingData?.tracking ? (
          <TrackingTimeline
            tracking={trackingData.tracking}
            description={trackingData.package.description}
          />
        ) : (
          <Alert
            severity="info"
            sx={{
              mt: { xs: 1, sm: 2 },
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          >
            Não foi possível obter informações de rastreamento.
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};
