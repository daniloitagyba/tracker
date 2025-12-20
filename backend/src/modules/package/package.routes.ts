import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { trackPackage } from '../../services/tracking.service.js';
import {
  createPackageSchema,
  updatePackageSchema,
  packageParamsSchema,
  type CreatePackageInput,
  type UpdatePackageInput,
  type PackageParams,
} from '../../schemas/package.schema.js';

export const packageRoutes = async (fastify: FastifyInstance) => {
  // List all packages for the current user
  fastify.get(
    '/packages',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.user;

      const packages = await prisma.package.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send(packages);
    }
  );

  // Get single package
  fastify.get<{ Params: PackageParams }>(
    '/packages/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = packageParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send({ error: 'Invalid package ID' });
      }

      const { userId } = request.user;

      const pkg = await prisma.package.findFirst({
        where: {
          id: params.data.id,
          userId,
        },
      });

      if (!pkg) {
        return reply.status(404).send({ error: 'Package not found' });
      }

      return reply.send(pkg);
    }
  );

  // Create package
  fastify.post<{ Body: CreatePackageInput }>(
    '/packages',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const body = createPackageSchema.safeParse(request.body);

      if (!body.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: body.error.flatten().fieldErrors,
        });
      }

      const { userId } = request.user;

      const pkg = await prisma.package.create({
        data: {
          ...body.data,
          userId,
        },
      });

      return reply.status(201).send(pkg);
    }
  );

  // Update package
  fastify.put<{ Params: PackageParams; Body: UpdatePackageInput }>(
    '/packages/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = packageParamsSchema.safeParse(request.params);
      const body = updatePackageSchema.safeParse(request.body);

      if (!params.success) {
        return reply.status(400).send({ error: 'Invalid package ID' });
      }

      if (!body.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: body.error.flatten().fieldErrors,
        });
      }

      const { userId } = request.user;

      // Check if package belongs to user
      const existingPkg = await prisma.package.findFirst({
        where: {
          id: params.data.id,
          userId,
        },
      });

      if (!existingPkg) {
        return reply.status(404).send({ error: 'Package not found' });
      }

      const pkg = await prisma.package.update({
        where: { id: params.data.id },
        data: body.data,
      });

      return reply.send(pkg);
    }
  );

  // Delete package
  fastify.delete<{ Params: PackageParams }>(
    '/packages/:id',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = packageParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send({ error: 'Invalid package ID' });
      }

      const { userId } = request.user;

      // Check if package belongs to user
      const existingPkg = await prisma.package.findFirst({
        where: {
          id: params.data.id,
          userId,
        },
      });

      if (!existingPkg) {
        return reply.status(404).send({ error: 'Package not found' });
      }

      await prisma.package.delete({
        where: { id: params.data.id },
      });

      return reply.status(204).send();
    }
  );

  // Track package
  fastify.get<{ Params: PackageParams }>(
    '/packages/:id/track',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const params = packageParamsSchema.safeParse(request.params);

      if (!params.success) {
        return reply.status(400).send({ error: 'Invalid package ID' });
      }

      const { userId } = request.user;

      // Get package
      const pkg = await prisma.package.findFirst({
        where: {
          id: params.data.id,
          userId,
        },
      });

      if (!pkg) {
        return reply.status(404).send({ error: 'Package not found' });
      }

      // If package is already delivered, return cached data from database
      if (pkg.isDelivered) {
        console.log(`[Track] Package ${pkg.trackingCode} already delivered, using cached data`);
        
        // Build tracking info from cached data
        const cachedTracking = {
          code: pkg.trackingCode,
          events: pkg.lastStatus ? [{
            date: pkg.lastUpdate ? new Date(pkg.lastUpdate).toLocaleDateString('pt-BR') : '',
            time: pkg.lastUpdate ? new Date(pkg.lastUpdate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
            location: pkg.lastLocation || '',
            status: pkg.lastStatus,
            description: 'Objeto entregue ao destinatário',
          }] : [],
          isDelivered: true,
          lastUpdate: pkg.lastUpdate ? new Date(pkg.lastUpdate).toLocaleDateString('pt-BR') : null,
        };

        return reply.send({
          package: pkg,
          tracking: cachedTracking,
        });
      }

      try {
        const trackingInfo = await trackPackage(pkg.trackingCode);

        // Update package with last tracking info
        if (trackingInfo.events.length > 0) {
          const lastEvent = trackingInfo.events[0];
          
          // Parse event date from "dd/mm/yyyy" format
          let eventDate: Date | null = null;
          if (lastEvent.date) {
            const [day, month, year] = lastEvent.date.split('/');
            const timeStr = lastEvent.time || '00:00';
            const [hour, minute] = timeStr.split(':');
            eventDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour) || 0,
              parseInt(minute) || 0
            );
          }
          
          await prisma.package.update({
            where: { id: pkg.id },
            data: {
              lastStatus: lastEvent.status,
              lastLocation: lastEvent.location || null,
              lastUpdate: eventDate || new Date(),
              isDelivered: trackingInfo.isDelivered,
            },
          });
        }

        // Get updated package
        const updatedPkg = await prisma.package.findFirst({
          where: { id: pkg.id },
        });

        return reply.send({
          package: updatedPkg,
          tracking: trackingInfo,
        });
      } catch (error) {
        console.error('Tracking error:', error);
        return reply.status(502).send({ error: 'Failed to fetch tracking information' });
      }
    }
  );
};

