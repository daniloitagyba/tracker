import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

interface EmptyStateProps {
  variant: 'no-packages' | 'no-filtered-packages';
  filterLabel?: string;
  onViewAll?: () => void;
}

export const EmptyState = ({ variant, filterLabel, onViewAll }: EmptyStateProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (variant === 'no-packages') {
    return (
      <Box
        sx={{
          py: { xs: 6, sm: 8 },
          px: { xs: 1.5, sm: 3 },
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          mx: { xs: 0.5, sm: 0 },
          width: { xs: 'calc(100% - 4px)', sm: '100%' },
        }}
      >
        <Inventory2RoundedIcon
          sx={{
            fontSize: { xs: 48, sm: 64 },
            color: 'text.secondary',
            mb: 2,
            opacity: 0.5,
          }}
        />
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          color="text.secondary"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          No packages registered
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Add your first package to start tracking
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 5, sm: 6 },
        px: { xs: 1.5, sm: 3 },
        textAlign: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        mx: { xs: 0.5, sm: 0 },
        width: { xs: 'calc(100% - 4px)', sm: '100%' },
      }}
    >
      <Inventory2RoundedIcon
        sx={{
          fontSize: { xs: 40, sm: 48 },
          color: 'text.secondary',
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography
        variant={isMobile ? 'body2' : 'body1'}
        color="text.secondary"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        No packages {filterLabel}
      </Typography>
      <Typography
        variant="body2"
        color="primary"
        sx={{
          cursor: 'pointer',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          fontWeight: 500,
          '&:hover': { textDecoration: 'underline' },
        }}
        onClick={onViewAll}
      >
        View all packages
      </Typography>
    </Box>
  );
};