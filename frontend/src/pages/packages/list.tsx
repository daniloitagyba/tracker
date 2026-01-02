import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useList } from '@refinedev/core';
import {
  Box,
  Skeleton,
  Alert,
  Snackbar,
  Fab,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { apiRequest } from '../../services/api';
import type { Package, PackageWithTracking } from '../../types';
import { PackageCard } from '../../components/packages/PackageCard';
import { StatsCard, FilterType } from '../../components/packages/StatsCard';
import { Layout } from '../../components/layout/Layout';
import {
  EmptyState,
  UpdateAllButton,
  TrackingDialog,
  DeleteDialog,
  LoadingSkeleton,
} from '../../components/packages/list';
import { usePackageTracking } from '../../hooks/usePackageTracking';
import { usePackageDelete } from '../../hooks/usePackageDelete';
import { useBulkUpdate } from '../../hooks/useBulkUpdate';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  calculatePackageStats,
  filterPackages,
  getInTransitPackages,
  getFilterLabel,
} from '../../utils/packageHelpers';

export function PackageListPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeFilter, setActiveFilter] = useState<FilterType>('in_transit');
  const [updatingSinglePackageId, setUpdatingSinglePackageId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useList<Package>({
    resource: 'packages',
  });

  const { snackbar, showSuccess, showError, closeSnackbar } = useSnackbar();

  const {
    trackingOpen,
    selectedPackageId,
    trackingData,
    isTrackingLoading,
    openTracking,
    closeTracking,
  } = usePackageTracking();

  const {
    deleteDialogOpen,
    packageToDelete,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  } = usePackageDelete({
    onSuccess: async () => {
      closeTracking();
      showSuccess('Pacote removido com sucesso!');
      await refetch();
    },
    onError: () => {
      showError('Erro ao remover pacote. Tente novamente.');
    },
  });

  const { isUpdating, progress, currentPackageId, updateAll, getCurrentPackage } = useBulkUpdate({
    onComplete: async ({ successCount, errorCount }) => {
      await refetch();
      if (errorCount === 0) {
        showSuccess(`Todas as ${successCount} encomendas foram atualizadas com sucesso!`);
      } else {
        showError(`${successCount} encomendas atualizadas. ${errorCount} falharam.`);
      }
    },
  });

  const packages = data?.data || [];
  const stats = calculatePackageStats(packages);
  const filteredPackages = filterPackages(packages, activeFilter);
  const inTransitPackages = getInTransitPackages(packages);
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);
  const currentUpdatingPackage = getCurrentPackage(inTransitPackages);

  const handlePackageClick = (pkg: Package) => {
    openTracking(pkg.id);
  };

  const handleCloseTracking = () => {
    closeTracking();
    refetch();
  };

  const handleAddPackage = () => {
    navigate('/packages/add');
  };

  const handleBulkUpdate = () => {
    updateAll(inTransitPackages);
  };

  const handleUpdatePackage = async (pkg: Package) => {
    setUpdatingSinglePackageId(pkg.id);

    try {
      await apiRequest<PackageWithTracking>(`/packages/${pkg.id}/track`, {
        method: 'GET',
      });

      showSuccess('Pacote atualizado com sucesso!');
      await refetch();
    } catch (error) {
      console.error(`Error updating package ${pkg.trackingCode}:`, error);
      showError('Erro ao atualizar pacote. Tente novamente.');
    } finally {
      setUpdatingSinglePackageId(null);
    }
  };

  const renderContent = () => {
    if (isLoading && packages.length === 0) {
      return (
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
            sx={{ color: 'primary.main' }}
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
      );
    }

    return (
      <>
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

        {activeFilter === 'in_transit' && (
          <UpdateAllButton
            packages={inTransitPackages}
            isUpdating={isUpdating}
            progress={progress}
            currentPackage={currentUpdatingPackage}
            onUpdate={handleBulkUpdate}
          />
        )}

        {isLoading && packages.length > 0 ? (
          <LoadingSkeleton />
        ) : packages.length === 0 ? (
          <EmptyState variant="no-packages" />
        ) : filteredPackages.length === 0 ? (
          <EmptyState
            variant="no-filtered-packages"
            filterLabel={getFilterLabel(activeFilter)}
            onViewAll={() => setActiveFilter('all')}
          />
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
                  onUpdate={handleUpdatePackage}
                  isUpdating={updatingSinglePackageId === pkg.id}
                />
              </Box>
            ))}
          </Box>
        )}
      </>
    );
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
        {renderContent()}
      </Box>

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

      <TrackingDialog
        open={trackingOpen}
        onClose={handleCloseTracking}
        selectedPackage={selectedPackage}
        trackingData={trackingData?.data}
        isLoading={isTrackingLoading}
        onDelete={openDeleteDialog}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        packageToDelete={packageToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};
