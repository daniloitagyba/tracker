import { Box, Skeleton, useMediaQuery, useTheme } from '@mui/material';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton = ({ count = 3 }: LoadingSkeletonProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, sm: 2 },
        px: { xs: 0.5, sm: 0 },
        width: '100%',
        alignItems: { xs: 'center', sm: 'stretch' },
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ width: '100%', maxWidth: '100%' }}>
          <Skeleton
            variant="rounded"
            height={isMobile ? 100 : 120}
            sx={{ borderRadius: 3 }}
          />
        </Box>
      ))}
    </Box>
  );
};
