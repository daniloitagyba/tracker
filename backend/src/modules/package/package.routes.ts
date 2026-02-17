import type { FastifyInstance } from 'fastify';
import { PackageController } from '../../controllers/package.controller.js';
import {
  createPackageSchema,
  updatePackageSchema,
  packageParamsSchema,
  CreatePackageInput,
  UpdatePackageInput,
  PackageParams,
} from '../../schemas/package.schema.js';

export async function packageRoutes(fastify: FastifyInstance) {
  const controller = new PackageController();

  fastify.get(
    '/packages',
    { preHandler: [fastify.authenticate] },
    controller.list
  );

  fastify.get<{ Params: PackageParams }>(
    '/packages/:id',
    { 
      preHandler: [fastify.authenticate],
      schema: { params: packageParamsSchema }
    },
    controller.get
  );

  fastify.post<{ Body: CreatePackageInput }>(
    '/packages',
    { 
      preHandler: [fastify.authenticate],
      schema: { body: createPackageSchema }
    },
    controller.create
  );

  fastify.put<{ Params: PackageParams; Body: UpdatePackageInput }>(
    '/packages/:id',
    { 
      preHandler: [fastify.authenticate],
      schema: { params: packageParamsSchema, body: updatePackageSchema }
    },
    controller.update
  );

  fastify.delete<{ Params: PackageParams }>(
    '/packages/:id',
    { 
      preHandler: [fastify.authenticate],
      schema: { params: packageParamsSchema }
    },
    controller.delete
  );

  fastify.get<{ Params: PackageParams }>(
    '/packages/:id/track',
    { 
      preHandler: [fastify.authenticate],
      schema: { params: packageParamsSchema }
    },
    controller.track
  );
}
