import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useList, useCustom } from '@refinedev/core';
import {
  Box,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  Snackbar,
  Fab,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import type { Package, PackageWithTracking, PackageStats } from '../../types';
import { PackageCard } from '../../components/packages/PackageCard';
import { StatsCard, FilterType } from '../../components/packages/StatsCard';
import { Layout } from '../../components/layout/Layout';
import { TrackingTimeline } from '../../components/packages/TrackingTimeline';

export const PackageListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('in_transit');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, refetch } = useList<Package>({
    resource: 'packages',
  });

  const { data: trackingData, isLoading: isTrackingLoading } = useCustom<PackageWithTracking>({
    url: `/packages/${selectedPackageId}/track`,
    method: 'get',
    queryOptions: {
      enabled: !!selectedPackageId && trackingOpen,
    },
  });

  const packages = data?.data || [];

  // Helper function to determine package category
  const getPackageCategory = (pkg: Package): 'delivered' | 'in_transit' => {
    if (pkg.isDelivered) return 'delivered';
    return 'in_transit';
  };

  // Calculate stats from packages using isDelivered from database
  const stats: PackageStats = packages.reduce(
    (acc, pkg) => {
      acc.total++;
      const category = getPackageCategory(pkg);
      if (category === 'delivered') {
        acc.delivered++;
      } else {
        acc.inTransit++;
      }
      return acc;
    },
    { onRoute: 0, inTransit: 0, delivered: 0, total: 0 }
  );

  // Filter packages based on active filter
  const filteredPackages = packages.filter((pkg) => {
    if (activeFilter === 'all') return true;
    const category = getPackageCategory(pkg);
    if (activeFilter === 'delivered') return category === 'delivered';
    if (activeFilter === 'in_transit') return category === 'in_transit';
    return true;
  });

  // Get filter label for empty state
  const getFilterLabel = (filter: FilterType): string => {
    switch (filter) {
      case 'in_transit': return 'em trânsito';
      case 'delivered': return 'entregues';
      default: return '';
    }
  };

  const handlePackageClick = (pkg: Package) => {
    setSelectedPackageId(pkg.id);
    setTrackingOpen(true);
  };

  const handleCloseTracking = () => {
    setTrackingOpen(false);
    setSelectedPackageId(null);
    // Refetch to update stats after tracking
    refetch();
  };

  const handleAddPackage = () => {
    navigate('/packages/add');
  };

  return (
    <Layout>
      <Box 
        sx={{ 
          pb: { xs: 12, sm: 10 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', sm: 'stretch' },
        }}
      >
        {/* Loading Spinner - Initial Load */}
        {isLoading && packages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: { xs: '50vh', sm: '60vh' },
              gap: 3,
            }}
          >
            <CircularProgress 
              size={isMobile ? 48 : 56} 
              thickness={4}
              sx={{
                color: 'primary.main',
              }}
            />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
              }}
            >
              Carregando encomendas...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Stats Card */}
            <Box 
              sx={{ 
                mb: { xs: 2.5, sm: 3 }, 
                width: '100%',
                px: { xs: 0.5, sm: 0 },
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: '100%', maxWidth: '100%' }}>
                {isLoading ? (
                  <Skeleton 
                    variant="rounded" 
                    height={isMobile ? 100 : 120} 
                    sx={{ borderRadius: 4 }} 
                  />
                ) : (
                  <StatsCard
                    inTransit={stats.inTransit}
                    delivered={stats.delivered}
                    total={stats.total}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                )}
              </Box>
            </Box>

            {/* Package List */}
            {isLoading && packages.length > 0 ? (
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
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ width: '100%', maxWidth: '100%' }}>
                    <Skeleton 
                      variant="rounded" 
                      height={isMobile ? 100 : 120} 
                      sx={{ borderRadius: 3 }} 
                    />
                  </Box>
                ))}
              </Box>
            ) : packages.length === 0 ? (
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
                opacity: 0.5 
              }} 
            />
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Nenhuma encomenda cadastrada
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Adicione sua primeira encomenda para começar a rastrear
            </Typography>
          </Box>
        ) : filteredPackages.length === 0 ? (
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
                opacity: 0.5 
              }} 
            />
            <Typography 
              variant={isMobile ? 'body2' : 'body1'} 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Nenhuma encomenda {getFilterLabel(activeFilter)}
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
              onClick={() => setActiveFilter('all')}
            >
              Ver todas as encomendas
            </Typography>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1.5, sm: 2 },
              width: '100%',
              alignItems: { xs: 'center', sm: 'stretch' },
              px: { xs: 0.5, sm: 0 },
            }}
          >
            {filteredPackages.map((pkg) => (
              <Box
                key={pkg.id}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <PackageCard
                  pkg={pkg}
                  onClick={handlePackageClick}
                />
              </Box>
            ))}
          </Box>
        )}
          </>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleAddPackage}
        sx={{
          position: 'fixed',
          bottom: { xs: 20, sm: 24 },
          right: { xs: 20, sm: 24 },
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          boxShadow: isMobile 
            ? '0 4px 16px rgba(59, 130, 246, 0.5)' 
            : '0 8px 32px rgba(59, 130, 246, 0.4)',
          zIndex: 1000,
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
        aria-label="Adicionar encomenda"
      >
        <AddRoundedIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
      </Fab>

      {/* Tracking Dialog */}
      <Dialog
        open={trackingOpen}
        onClose={handleCloseTracking}
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
              fontSize: { xs: '1.125rem', sm: '1.25rem' } 
            }}
          >
            Rastreamento
          </Typography>
          <IconButton 
            onClick={handleCloseTracking} 
            size={isMobile ? 'medium' : 'large'}
            sx={{
              '&:active': {
                transform: 'scale(0.9)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
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
          {isTrackingLoading ? (
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
          ) : trackingData?.data?.tracking ? (
            <TrackingTimeline tracking={trackingData.data.tracking} />
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};
