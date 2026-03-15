import { useState } from 'react';
import { apiRequest } from '../services/api';
import type { Package } from '../types';

interface UsePackageDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const usePackageDelete = ({ onSuccess, onError }: UsePackageDeleteOptions = {}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteDialog = (pkg: Package) => {
    setPackageToDelete(pkg);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPackageToDelete(null);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;

    setIsDeleting(true);
    try {
      await apiRequest(`/packages/${packageToDelete.id}`, { method: 'DELETE' });
      closeDeleteDialog();
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDialogOpen,
    packageToDelete,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
};
