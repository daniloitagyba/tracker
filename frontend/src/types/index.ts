export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export type PackageStatus = 'pending' | 'in_transit' | 'on_route' | 'delivered';

export type CarrierType = 'correios' | 'aliexpress';

export interface Package {
  id: string;
  description: string;
  trackingCode: string;
  userId: string;
  carrier?: CarrierType;
  status?: PackageStatus;
  lastStatus?: string;
  lastLocation?: string;
  lastUpdate?: string;
  isDelivered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  date: string;
  time: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingInfo {
  code: string;
  events: TrackingEvent[];
  isDelivered: boolean;
  lastUpdate: string | null;
}

export interface PackageWithTracking {
  package: Package;
  tracking: TrackingInfo;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PackageStats {
  onRoute: number;
  inTransit: number;
  delivered: number;
  total: number;
}
