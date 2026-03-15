import type { Package, PackageStats } from '../types';
import type { FilterType } from '../components/packages/StatsCard';

export type PackageCategory = 'delivered' | 'in_transit';

export const getPackageCategory = (pkg: Package): PackageCategory => {
  return pkg.isDelivered ? 'delivered' : 'in_transit';
};

export const calculatePackageStats = (packages: Package[]): PackageStats => {
  return packages.reduce(
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
    { inTransit: 0, delivered: 0, total: 0 }
  );
};

export const filterPackages = (packages: Package[], filter: FilterType): Package[] => {
  if (filter === 'all') return packages;

  return packages.filter((pkg) => {
    const category = getPackageCategory(pkg);
    if (filter === 'delivered') return category === 'delivered';
    if (filter === 'in_transit') return category === 'in_transit';
    return true;
  });
};

export const getInTransitPackages = (packages: Package[]): Package[] => {
  return packages.filter((pkg) => !pkg.isDelivered);
};

export const formatTimeAgo = (dateString?: string | null): string | null => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return 'há poucos minutos';
  if (diffInHours < 24) return `há cerca de ${diffInHours} horas`;
  if (diffInDays === 1) return 'há 1 dia';
  return `há ${diffInDays} dias`;
};

export const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case 'in_transit':
      return 'em trânsito';
    case 'delivered':
      return 'entregue';
    default:
      return '';
  }
};