import { Box, Button, CircularProgress, LinearProgress, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { Package } from '../../../types';

interface UpdateAllButtonProps {
  packages: Package[];
  isUpdating: boolean;
  progress: { current: number; total: number };
  currentPackage?: Package;
  onUpdate: () => void;
}

export const UpdateAllButton = ({
  packages,
  isUpdating,
  progress,
  currentPackage,
  onUpdate,
}: UpdateAllButtonProps) => {
  if (packages.length === 0) return null;

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 2.5 },
        width: '100%',
        px: { xs: 0.5, sm: 0 },
      }}
    >
      <Button
        variant="contained"
        startIcon={
          isUpdating ? (
            <CircularProgress size={16} sx={{ color: 'inherit' }} />
          ) : (
            <RefreshRoundedIcon />
          )
        }
        onClick={onUpdate}
        disabled={isUpdating}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
          },
        }}
      >
        {isUpdating
          ? `Atualizando... (${progress.current}/${progress.total})`
          : `Atualizar Todas (${packages.length})`}
      </Button>

      {isUpdating && currentPackage && (
        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={(progress.current / progress.total) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 1,
              display: 'block',
              textAlign: 'center',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Atualizando: {currentPackage.description || currentPackage.trackingCode}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
