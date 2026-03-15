import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/api';
import type { PackageWithTracking } from '../types';

export const usePackageTracking = () => {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const {
    data: trackingData,
    isLoading: isTrackingLoading,
    error: trackingError,
  } = useQuery({
    queryKey: ['tracking', selectedPackageId],
    queryFn: () => apiRequest<PackageWithTracking>(`/packages/${selectedPackageId}/track`),
    enabled: !!selectedPackageId && trackingOpen,
    retry: 1,
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
    trackingError,
    openTracking,
    closeTracking,
  };
};
