import { prisma } from '../lib/prisma.js';
import { trackPackage, TrackingResponse } from './tracking.service.js';
import { parseTrackingDate } from '../utils/formatters.js';
import type { CreatePackageInput, UpdatePackageInput } from '../schemas/package.schema.js';

export class PackageService {
  async listPackages(userId: string) {
    return prisma.package.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPackage(userId: string, id: string) {
    return prisma.package.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async createPackage(userId: string, data: CreatePackageInput) {
    const { carrier, ...prismaData } = data;
    let pkg = await prisma.package.create({
      data: {
        ...prismaData,
        userId,
      },
    });

    try {
      const trackingInfo = await trackPackage(pkg.trackingCode);

      if (trackingInfo.events.length > 0) {
        const lastEvent = trackingInfo.events[0];
        const eventDate = lastEvent.date ? parseTrackingDate(lastEvent.date, lastEvent.time) : new Date();
        
        const destination = lastEvent.description?.replace('Destino: ', '') || null;
        pkg = await prisma.package.update({
          where: { id: pkg.id },
          data: {
            lastStatus: lastEvent.status,
            lastLocation: lastEvent.location || null,
            lastDestination: destination,
            lastUpdate: eventDate,
            isDelivered: trackingInfo.isDelivered,
          },
        });
      }
    } catch (error) {
      console.error(`[Initial Track] Failed for ${pkg.trackingCode}:`, error);
    }

    return pkg;
  }

  async updatePackage(userId: string, id: string, data: UpdatePackageInput) {
    const existingPkg = await this.getPackage(userId, id);

    if (!existingPkg) {
      return null;
    }

    const { carrier, ...prismaData } = data;
    return prisma.package.update({
      where: { id },
      data: prismaData,
    });
  }

  async deletePackage(userId: string, id: string) {
    const existingPkg = await this.getPackage(userId, id);

    if (!existingPkg) {
      return null;
    }

    await prisma.package.delete({
      where: { id },
    });
    
    return true;
  }

  async trackPackage(userId: string, id: string) {
    const pkg = await this.getPackage(userId, id);

    if (!pkg) {
      return null;
    }

    if (pkg.isDelivered) {
      console.log(`[Track] Package ${pkg.trackingCode} already delivered, using cached data`);
      
      const cachedTracking: TrackingResponse = {
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

      return {
        package: pkg,
        tracking: cachedTracking,
      };
    }

    const trackingInfo = await trackPackage(pkg.trackingCode);

    if (trackingInfo.events.length > 0) {
      const lastEvent = trackingInfo.events[0];
      const eventDate = lastEvent.date ? parseTrackingDate(lastEvent.date, lastEvent.time) : new Date();
      
      const destination = lastEvent.description?.replace('Destino: ', '') || null;
      await prisma.package.update({
        where: { id: pkg.id },
        data: {
          lastStatus: lastEvent.status,
          lastLocation: lastEvent.location || null,
          lastDestination: destination,
          lastUpdate: eventDate,
          isDelivered: trackingInfo.isDelivered,
        },
      });
    }

    const updatedPkg = await prisma.package.findFirst({
      where: { id: pkg.id },
    });

    return {
      package: updatedPkg,
      tracking: trackingInfo,
    };
  }
}
