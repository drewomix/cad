import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from './audit.service.js';
import type { PersonInput, VehicleInput } from '@cad/shared';
import { incidentSchema, toPostgresPoint } from '@cad/shared';

@Injectable()
export class CitizenService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listPersons(userId: string) {
    return this.prisma.person.findMany({
      where: { submittedById: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPerson(userId: string, dto: PersonInput) {
    const person = await this.prisma.person.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dob: new Date(dto.dob),
        sex: dto.sex,
        race: dto.race,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        dlNumber: dto.dlNumber,
        flags: dto.flags,
        notes: dto.notes,
        photos: [],
        submittedById: userId
      }
    });
    await this.audit.log(userId, 'person.created', 'Person', person.id, dto);
    return person;
  }

  async approvePerson(actorId: string, personId: string, approvalStatus: 'APPROVED' | 'REJECTED', notes?: string) {
    const person = await this.prisma.person.findUnique({ where: { id: personId } });
    if (!person) throw new NotFoundException('Person not found');
    const updated = await this.prisma.person.update({
      where: { id: personId },
      data: { approvalStatus, notes: notes ?? person.notes }
    });
    await this.audit.log(actorId, `person.${approvalStatus.toLowerCase()}`, 'Person', personId, {
      approvalStatus,
      notes
    });
    return updated;
  }

  listVehicles(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { submittedById: userId },
      orderBy: { createdAt: 'desc' },
      include: { owner: true }
    });
  }

  async createVehicle(userId: string, dto: VehicleInput & { ownerPersonId?: string }) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        plate: dto.plate.toUpperCase(),
        state: dto.state.toUpperCase(),
        vin: dto.vin,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        color: dto.color,
        insuranceStatus: dto.insuranceStatus,
        ownerPersonId: dto.ownerPersonId,
        flags: [],
        submittedById: userId
      }
    });
    await this.audit.log(userId, 'vehicle.created', 'Vehicle', vehicle.id, dto);
    return vehicle;
  }

  async approveVehicle(actorId: string, vehicleId: string, approvalStatus: 'APPROVED' | 'REJECTED', notes?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { approvalStatus, notes }
    });
    await this.audit.log(actorId, `vehicle.${approvalStatus.toLowerCase()}`, 'Vehicle', vehicleId, {
      approvalStatus,
      notes
    });
    return updated;
  }

  pendingSubmissions() {
    return Promise.all([
      this.prisma.person.findMany({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.vehicle.findMany({ where: { approvalStatus: 'PENDING' }, include: { owner: true } })
    ]);
  }

  async submitOnlineReport(userId: string, payload: any) {
    const dto = incidentSchema.parse(payload);
    const incident = await this.prisma.incident.create({
      data: {
        priority: dto.priority,
        type: dto.type,
        address: dto.address,
        narrative: `[CITIZEN ONLINE REPORT] ${dto.narrative}`,
        locationGeom: toPostgresPoint({ lat: dto.locationLat, lng: dto.locationLng }),
        createdById: userId,
        status: 'OPEN'
      }
    });
    await this.audit.log(userId, 'citizen.online_report', 'Incident', incident.id, dto);
    return incident;
  }
}
