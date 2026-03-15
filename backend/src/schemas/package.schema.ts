import { z } from 'zod';

export const createPackageSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  trackingCode: z.string().min(1, 'Código de rastreio é obrigatório'),
  carrier: z.string().optional(),
});

export const updatePackageSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  trackingCode: z.string().min(1, 'Código de rastreio é obrigatório').optional(),
  carrier: z.string().optional(),
});

export const packageParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageParams = z.infer<typeof packageParamsSchema>;
