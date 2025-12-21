import { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useList, useCustom, useDelete } from '@refinedev/core';
import {
  Box,
  Typography,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  Fab,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Button,
  LinearProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { apiRequest } from '../../services/api';
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
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);
  const [updatingSinglePackageId, setUpdatingSinglePackageId] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState({ current: 0, total: 0 });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, refetch } = useList<Package>({
    resource: 'packages',
  });

  const { mutate: deletePackage } = useDelete();

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

  // Get packages in transit for bulk update
  const inTransitPackages = packages.filter((pkg) => !pkg.isDelivered);

  // Handle bulk update
  const handleUpdateAll = async () => {
    if (inTransitPackages.length === 0) return;

    setIsUpdatingAll(true);
    setUpdateProgress({ current: 0, total: inTransitPackages.length });
    setUpdatingPackageId(null);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < inTransitPackages.length; i++) {
      const pkg = inTransitPackages[i];
      setUpdatingPackageId(pkg.id);
      setUpdateProgress({ current: i + 1, total: inTransitPackages.length });

      try {
        await apiRequest<PackageWithTracking>(`/packages/${pkg.id}/track`, {
          method: 'GET',
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating package ${pkg.trackingCode}:`, error);
        errorCount++;
      }

      // Small delay to avoid overwhelming the API
      if (i < inTransitPackages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setIsUpdatingAll(false);
    setUpdatingPackageId(null);
    setUpdateProgress({ current: 0, total: 0 });

    // Refresh the list
    await refetch();

    // Show result message
    if (errorCount === 0) {
      setSnackbar({
        open: true,
        message: `Todas as ${successCount} encomendas foram atualizadas com sucesso!`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: `${successCount} encomendas atualizadas. ${errorCount} falharam.`,
        severity: 'error',
      });
    }
  };

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

  // Get the selected package for deletion
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);

  const handleCloseTracking = () => {
    setTrackingOpen(false);
    setSelectedPackageId(null);
    // Refetch to update stats after tracking
    refetch();
  };

  const handleAddPackage = () => {
    navigate('/packages/add');
  };

  const handleDeleteClick = (pkg: Package) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    setIsDeleting(true);
    try {
      await new Promise<void>((resolve, reject) => {
        deletePackage(
          {
            resource: 'packages',
            id: packageToDelete.id,
          },
          {
            onSuccess: async () => {
              // Close dialogs first
              setDeleteDialogOpen(false);
              setPackageToDelete(null);
              setTrackingOpen(false);
              setSelectedPackageId(null);
              
              // Show success message
              setSnackbar({
                open: true,
                message: 'Pacote removido com sucesso!',
                severity: 'success',
              });
              
              // Force refetch to ensure list is updated
              await refetch();
              
              resolve();
            },
            onError: (error) => {
              console.error('Error deleting package:', error);
              setSnackbar({
                open: true,
                message: 'Erro ao remover pacote. Tente novamente.',
                severity: 'error',
              });
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      // Error already handled in onError callback
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPackageToDelete(null);
  };

  const handleUpdatePackage = async (pkg: Package) => {
    setUpdatingSinglePackageId(pkg.id);
    
    try {
      await apiRequest<PackageWithTracking>(`/packages/${pkg.id}/track`, {
        method: 'GET',
      });
      
      setSnackbar({
        open: true,
        message: 'Pacote atualizado com sucesso!',
        severity: 'success',
      });
      
      // Refresh the list
      await refetch();
    } catch (error) {
      console.error(`Error updating package ${pkg.trackingCode}:`, error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar pacote. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setUpdatingSinglePackageId(null);
    }
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

            {/* Update All Button - Only show when filter is in_transit */}
            {activeFilter === 'in_transit' && inTransitPackages.length > 0 && (
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
                    isUpdatingAll ? (
                      <CircularProgress size={16} sx={{ color: 'inherit' }} />
                    ) : (
                      <RefreshRoundedIcon />
                    )
                  }
                  onClick={handleUpdateAll}
                  disabled={isUpdatingAll}
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
                  {isUpdatingAll
                    ? `Atualizando... (${updateProgress.current}/${updateProgress.total})`
                    : `Atualizar Todas (${inTransitPackages.length})`}
                </Button>
                
                {/* Progress indicator showing current package */}
                {isUpdatingAll && updatingPackageId && (
                  <Box sx={{ mt: 1.5 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(updateProgress.current / updateProgress.total) * 100}
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
                      {(() => {
                        const currentPkg = inTransitPackages[updateProgress.current - 1];
                        return currentPkg
                          ? `Atualizando: ${currentPkg.description || currentPkg.trackingCode}`
                          : 'Processando...';
                      })()}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

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
                  onUpdate={handleUpdatePackage}
                  isUpdating={updatingSinglePackageId === pkg.id}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedPackage && (
              <IconButton 
                onClick={() => handleDeleteClick(selectedPackage)} 
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
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
          <IconButton
            onClick={handleDeleteCancel}
            size="small"
            disabled={isDeleting}
          >
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
            onClick={handleDeleteCancel}
            disabled={isDeleting}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 100,
            }}
            startIcon={
              isDeleting ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : null
            }
          >
            {isDeleting ? 'Removendo...' : 'Remover'}
          </Button>
        </DialogActions>
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
