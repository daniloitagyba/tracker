import { useState } from 'react';
import { useCustom } from '@refinedev/core';
import type { PackageWithTracking } from '../types';

export const usePackageTracking = () => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const { data: trackingData, isLoading: isTrackingLoading } = useCustom<PackageWithTracking>({
    url: `/packages/${selectedPackageId}/track`,
    method: 'get',
    queryOptions: {
      enabled: !!selectedPackageId && trackingOpen,
    },
  });

  const openTracking = (packageId: string) => {
    setSelectedPackageId(packageId);
    setTrackingOpen(true);
  };

  const closeTracking = () => {
    setTrackingOpen(false);
    setSelectedPackageId(null);
  };

  return {
    trackingOpen,
    selectedPackageId,
    trackingData,
    isTrackingLoading,
    openTracking,
    closeTracking,
  };
};