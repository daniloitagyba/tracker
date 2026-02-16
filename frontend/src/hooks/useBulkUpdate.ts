import { useState } from 'react';
import { apiRequest } from '../services/api';
import type { Package, PackageWithTracking } from '../types';

interface BulkUpdateProgress {
  current: number;
  total: number;
}

interface BulkUpdateResult {
  successCount: number;
  errorCount: number;
}

interface UseBulkUpdateOptions {
  onComplete?: (result: BulkUpdateResult) => void;
  delayBetweenRequests?: number;
}

export const useBulkUpdate = ({
  onComplete,
  delayBetweenRequests = 500,
}: UseBulkUpdateOptions = {}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState<BulkUpdateProgress>({ current: 0, total: 0 });
  const [currentPackageId, setCurrentPackageId] = useState<string | null>(null);

  const updateAll = async (packages: Package[]) => {
    if (packages.length === 0) return;

    setIsUpdating(true);
    setProgress({ current: 0, total: packages.length });
    setCurrentPackageId(null);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      setCurrentPackageId(pkg.id);
      setProgress({ current: i + 1, total: packages.length });

      try {
        await apiRequest<PackageWithTracking>(`/packages/${pkg.id}/track`, {
          method: 'GET',
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating package ${pkg.trackingCode}:`, error);
        errorCount++;
      }

      if (i < packages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
      }
    }

    setIsUpdating(false);
    setCurrentPackageId(null);
    setProgress({ current: 0, total: 0 });

    onComplete?.({ successCount, errorCount });
  };

  const getCurrentPackage = (packages: Package[]): Package | undefined => {
    if (!currentPackageId) return undefined;
    return packages.find((pkg) => pkg.id === currentPackageId);
  };

  return {
    isUpdating,
    progress,
    currentPackageId,
    updateAll,
    getCurrentPackage,
  };
};