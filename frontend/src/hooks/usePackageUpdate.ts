import { useState } from 'react';
import { apiRequest } from '../services/api';
import type { Package, PackageWithTracking } from '../types';

interface UsePackageUpdateOptions {
  onSuccess: () => void;
  onError: () => void;
}

export function usePackageUpdate({ onSuccess, onError }: UsePackageUpdateOptions) {
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);

  const updatePackage = async (pkg: Package) => {
    setUpdatingPackageId(pkg.id);

    try {
      await apiRequest<PackageWithTracking>(`/packages/${pkg.id}/track`, {
        method: 'GET',
      });
      onSuccess();
    } catch (error) {
      console.error(`Error updating package ${pkg.trackingCode}:`, error);
      onError();
    } finally {
      setUpdatingPackageId(null);
    }
  };

  return {
    updatingPackageId,
    updatePackage,
  };
}
