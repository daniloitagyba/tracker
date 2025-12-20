import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useList, useDelete, useCustom } from '@refinedev/core';
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
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import type { Package, PackageWithTracking, PackageStats } from '../../types';
import { PackageCard } from '../../components/packages/PackageCard';
import { StatsCard } from '../../components/packages/StatsCard';
import { Layout } from '../../components/layout/Layout';

const TrackingTimeline = lazy(() =>
  import('../../components/packages/TrackingTimeline').then((module) => ({
    default: module.TrackingTimeline,
  }))
);

export const PackageListPage = () => {
  const navigate = useNavigate();
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, refetch } = useList<Package>({
    resource: 'packages',
  });

  const { mutate: deletePackage } = useDelete<Package>();

  const { data: trackingData, isLoading: isTrackingLoading } = useCustom<PackageWithTracking>({
    url: `/packages/${selectedPackageId}/track`,
    method: 'get',
    queryOptions: {
      enabled: !!selectedPackageId && trackingOpen,
    },
  });

  const packages = data?.data || [];

  // Calculate stats from packages using isDelivered from database
  const stats: PackageStats = packages.reduce(
    (acc, pkg) => {
      acc.total++;
      if (pkg.isDelivered) {
        acc.delivered++;
      } else if (pkg.lastStatus) {
        // Has tracking info, count as in transit
        acc.inTransit++;
      } else {
        // No tracking info yet, count as pending/on route
        acc.onRoute++;
      }
      return acc;
    },
    { onRoute: 0, inTransit: 0, delivered: 0, total: 0 }
  );

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
      <Box sx={{ pb: 10 }}>
        {/* Stats Card */}
        <Box sx={{ mb: 3 }}>
          {isLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 4 }} />
          ) : (
            <StatsCard
              onRoute={stats.onRoute}
              inTransit={stats.inTransit}
              delivered={stats.delivered}
              total={stats.total}
            />
          )}
        </Box>

        {/* Package List */}
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
        ) : packages.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Inventory2RoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma encomenda cadastrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione sua primeira encomenda para começar a rastrear
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onClick={handlePackageClick}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleAddPackage}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          },
        }}
      >
        <AddRoundedIcon sx={{ fontSize: 28 }} />
      </Fab>

      {/* Tracking Dialog */}
      <Dialog
        open={trackingOpen}
        onClose={handleCloseTracking}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Rastreamento
          </Typography>
          <IconButton onClick={handleCloseTracking}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isTrackingLoading ? (
            <Box sx={{ py: 4 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="rounded" height={100} sx={{ mt: 2 }} />
              <Skeleton variant="rounded" height={100} sx={{ mt: 2 }} />
            </Box>
          ) : trackingData?.data?.tracking ? (
            <Suspense fallback={<Skeleton variant="rounded" height={300} />}>
              <TrackingTimeline tracking={trackingData.data.tracking} />
            </Suspense>
          ) : (
            <Alert severity="info">
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
