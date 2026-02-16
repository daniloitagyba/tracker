import { FastifyRequest, FastifyReply } from 'fastify';
import { PackageService } from '../services/package.service.js';
import { CreatePackageInput, UpdatePackageInput, PackageParams } from '../schemas/package.schema.js';

export class PackageController {
  private packageService: PackageService;

  constructor() {
    this.packageService = new PackageService();
  }

  create = async (request: FastifyRequest<{ Body: CreatePackageInput }>, reply: FastifyReply) => {
    const { userId } = request.user;
    const pkg = await this.packageService.createPackage(userId, request.body);
    return reply.status(201).send(pkg);
  }

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.user;
    const packages = await this.packageService.listPackages(userId);
    return reply.send(packages);
  }

  get = async (request: FastifyRequest<{ Params: PackageParams }>, reply: FastifyReply) => {
    const { userId } = request.user;
    const { id } = request.params;
    
    const pkg = await this.packageService.getPackage(userId, id);
    if (!pkg) {
      return reply.status(404).send({ error: 'Package not found' });
    }
    
    return reply.send(pkg);
  }

  update = async (request: FastifyRequest<{ Params: PackageParams; Body: UpdatePackageInput }>, reply: FastifyReply) => {
    const { userId } = request.user;
    const { id } = request.params;
    
    const pkg = await this.packageService.updatePackage(userId, id, request.body);
    if (!pkg) {
      return reply.status(404).send({ error: 'Package not found' });
    }
    
    return reply.send(pkg);
  }

  delete = async (request: FastifyRequest<{ Params: PackageParams }>, reply: FastifyReply) => {
    const { userId } = request.user;
    const { id } = request.params;
    
    const result = await this.packageService.deletePackage(userId, id);
    if (!result) {
      return reply.status(404).send({ error: 'Package not found' });
    }
    
    return reply.status(204).send();
  }

  track = async (request: FastifyRequest<{ Params: PackageParams }>, reply: FastifyReply) => {
    const { userId } = request.user;
    const { id } = request.params;
    
    try {
      const result = await this.packageService.trackPackage(userId, id);
      if (!result) {
        return reply.status(404).send({ error: 'Package not found' });
      }
      return reply.send(result);
    } catch (error) {
      console.error('Tracking error:', error);
      return reply.status(502).send({ error: 'Failed to fetch tracking information' });
    }
  }
}
