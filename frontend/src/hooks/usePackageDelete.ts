import { useState } from 'react';
import { useDelete } from '@refinedev/core';
import type { Package } from '../types';

interface UsePackageDeleteOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const usePackageDelete = ({ onSuccess, onError }: UsePackageDeleteOptions = {}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deletePackage } = useDelete();

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
      await new Promise<void>((resolve, reject) => {
        deletePackage(
          {
            resource: 'packages',
            id: packageToDelete.id,
          },
          {
            onSuccess: () => {
              closeDeleteDialog();
              onSuccess?.();
              resolve();
            },
            onError: (error) => {
              onError?.(error);
              reject(error);
            },
          }
        );
      });
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