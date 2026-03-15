import { Box, Typography, LinearProgress } from '@mui/material';
import { TRACKING_CODE_MAX_LENGTH } from '../../config/constants';

interface TrackingCodeVisualizerProps {
  trackingCode: string;
}

export function TrackingCodeVisualizer({ trackingCode }: TrackingCodeVisualizerProps) {
  const letters1 = trackingCode.slice(0, 2);
  const numbers = trackingCode.slice(2, 11);
  const letters2 = trackingCode.slice(11, 13);
  const isValid = trackingCode.length === TRACKING_CODE_MAX_LENGTH;

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: letters1.length > 0 ? 'primary.main' : 'text.secondary',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {letters1 || 'AA'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            2 letras
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          〉
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: numbers.length > 0 ? 'warning.main' : 'text.secondary',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {numbers || '123456789'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            9 números
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          〉
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: letters2.length > 0 ? 'secondary.main' : 'text.secondary',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            {letters2 || 'BB'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            2 letras
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={(trackingCode.length / TRACKING_CODE_MAX_LENGTH) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 2,
              backgroundColor: isValid ? 'success.main' : 'primary.main',
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
            color: 'text.secondary',
          }}
        >
          {trackingCode.length}/{TRACKING_CODE_MAX_LENGTH}
        </Typography>
      </Box>
    </Box>
  );
}
