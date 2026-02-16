import { z } from 'zod';

export const createPackageSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  trackingCode: z.string().min(1, 'Tracking code is required'),
});

export const updatePackageSchema = z.object({
  description: z.string().min(1, 'Description is required').optional(),
  trackingCode: z.string().min(1, 'Tracking code is required').optional(),
});

export const packageParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageParams = z.infer<typeof packageParamsSchema>;
