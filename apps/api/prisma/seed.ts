import { PrismaClient } from '@prisma/client';
import { HashService } from '../src/security/hash.service.js';

const prisma = new PrismaClient();
const hashService = new HashService();

async function seed() {
  await prisma.auditLog.deleteMany();
  await prisma.bolo.deleteMany();
  await prisma.incidentUnit.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.report.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.person.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  const agency = await prisma.agency.create({ data: { name: 'Los Santos Police Department' } });

  const roles = [
    { email: 'admin@cad.local', role: 'ADMIN' },
    { email: 'supervisor@cad.local', role: 'SUPERVISOR' },
    { email: 'dispatcher@cad.local', role: 'DISPATCHER' },
    { email: 'officer@cad.local', role: 'OFFICER' },
    { email: 'records@cad.local', role: 'RECORDS' },
    { email: 'citizen@cad.local', role: 'CITIZEN' }
  ];

  const users = await Promise.all(
    roles.map(async ({ email, role }) => {
      const passwordHash = await hashService.hash('Password123!');
      return prisma.user.create({ data: { email, role, passwordHash, agencyId: agency.id } });
    })
  );

  const beats = await prisma.beat.createMany({
    data: [
      { name: 'Central', agencyId: agency.id },
      { name: 'Vespucci', agencyId: agency.id },
      { name: 'Davis', agencyId: agency.id }
    ]
  });
  console.log('Created beats', beats);

  const beatList = await prisma.beat.findMany({ where: { agencyId: agency.id } });

  const units = await prisma.$transaction(
    [
      prisma.unit.create({
        data: {
          callsign: '1A-01',
          type: 'PATROL',
          beatId: beatList[0]?.id,
          capability: ['patrol'],
          userId: users[3].id,
          dutyStatus: 'AVAILABLE'
        }
      }),
      prisma.unit.create({
        data: {
          callsign: '2L-20',
          type: 'SUPERVISOR',
          beatId: beatList[1]?.id,
          capability: ['supervisor'],
          userId: users[1].id,
          dutyStatus: 'AVAILABLE'
        }
      }),
      prisma.unit.create({
        data: {
          callsign: 'D-1',
          type: 'DISPATCH',
          capability: ['dispatch'],
          userId: users[2].id,
          dutyStatus: 'AVAILABLE'
        }
      })
    ]
  );
  console.log('Units created', units.length);

  const samplePersons = await prisma.$transaction(
    Array.from({ length: 20 }).map((_, idx) =>
      prisma.person.create({
        data: {
          firstName: `Person${idx + 1}`,
          lastName: 'Doe',
          dob: new Date(1990, idx % 12, (idx % 28) + 1),
          sex: 'M',
          race: 'W',
          heightCm: 180,
          weightKg: 82,
          flags: idx % 5 === 0 ? ['WARRANT_HIT'] : [],
          approvalStatus: 'APPROVED',
          submittedById: users[5].id
        }
      })
    )
  );
  console.log('Seeded persons', samplePersons.length);

  await prisma.$transaction(
    Array.from({ length: 15 }).map((_, idx) =>
      prisma.vehicle.create({
        data: {
          plate: `LS${1000 + idx}`,
          state: 'SA',
          make: 'Vapid',
          model: `Stanier ${idx}`,
          year: 2015,
          color: idx % 2 === 0 ? 'Black' : 'White',
          flags: idx % 3 === 0 ? ['STOLEN'] : [],
          approvalStatus: 'APPROVED',
          ownerPersonId: samplePersons[idx % samplePersons.length].id,
          submittedById: users[5].id
        }
      })
    )
  );

  const incidents = await prisma.$transaction(
    Array.from({ length: 6 }).map((_, idx) =>
      prisma.incident.create({
        data: {
          priority: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
          type: idx % 2 === 0 ? 'Traffic Stop' : 'Robbery',
          status: 'OPEN',
          address: `100${idx} Mission Row`,
          narrative: 'Initial call created from seed',
          locationGeom: `POINT(-118.${idx} 34.${idx})`,
          createdById: users[2].id
        }
      })
    )
  );

  await prisma.report.create({
    data: {
      incidentId: incidents[0].id,
      authorId: users[3].id,
      type: 'INCIDENT',
      status: 'APPROVED',
      bodyRtf: 'Sample approved report body',
      approvedById: users[1].id
    }
  });

  await prisma.citation.create({
    data: {
      personId: samplePersons[0].id,
      officerId: users[3].id,
      violations: ['Speeding', 'Failure to Yield'],
      location: 'Power St & Vespucci Blvd',
      fineTotal: 550,
      courtDate: new Date()
    }
  });

  await prisma.bolo.create({
    data: {
      category: 'VEHICLE',
      subjectRef: 'LS1001',
      description: 'Armed robbery suspect vehicle',
      lastSeenLocation: 'Del Perro Pier',
      createdById: users[2].id
    }
  });

  console.log('Seed completed');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
