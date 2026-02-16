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
    { onRoute: 0, inTransit: 0, delivered: 0, total: 0 }
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

export const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case 'in_transit':
      return 'in transit';
    case 'delivered':
      return 'delivered';
    default:
      return '';
  }
};