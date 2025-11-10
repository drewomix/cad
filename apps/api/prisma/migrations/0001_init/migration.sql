CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Agency" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "agencyId" UUID,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "mfaEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "verifiedAt" TIMESTAMP WITH TIME ZONE,
  "refreshToken" TEXT,
  CONSTRAINT "User_agency_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL
);

CREATE TABLE "Beat" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "agencyId" UUID NOT NULL,
  CONSTRAINT "Beat_agency_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE
);

CREATE TABLE "Unit" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "callsign" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "beatId" UUID,
  "capability" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "userId" UUID,
  "dutyStatus" TEXT NOT NULL DEFAULT 'OFF',
  "lastSeenAt" TIMESTAMP WITH TIME ZONE,
  "locationGeom" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Unit_beat_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE SET NULL,
  CONSTRAINT "Unit_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "Incident" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "number" SERIAL UNIQUE,
  "priority" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "openedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "closedAt" TIMESTAMP WITH TIME ZONE,
  "address" TEXT NOT NULL,
  "locationGeom" TEXT,
  "narrative" TEXT NOT NULL,
  "createdById" UUID,
  "dispatcherId" UUID,
  CONSTRAINT "Incident_createdBy_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Incident_dispatcher_fkey" FOREIGN KEY ("dispatcherId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "IncidentUnit" (
  "incidentId" UUID NOT NULL,
  "unitId" UUID NOT NULL,
  "assignedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "clearedAt" TIMESTAMP WITH TIME ZONE,
  "role" TEXT,
  PRIMARY KEY ("incidentId", "unitId"),
  CONSTRAINT "IncidentUnit_incident_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE,
  CONSTRAINT "IncidentUnit_unit_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE
);

CREATE TABLE "Person" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "dob" DATE NOT NULL,
  "sex" TEXT NOT NULL,
  "race" TEXT NOT NULL,
  "heightCm" INTEGER NOT NULL,
  "weightKg" INTEGER NOT NULL,
  "dlNumber" TEXT,
  "photos" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "flags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "submittedById" UUID,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "sealed" BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT "Person_submittedBy_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE TABLE "Vehicle" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "plate" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "vin" TEXT,
  "make" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "color" TEXT NOT NULL,
  "ownerPersonId" UUID,
  "insuranceStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "flags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "submittedById" UUID,
  "notes" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Vehicle_owner_fkey" FOREIGN KEY ("ownerPersonId") REFERENCES "Person"("id") ON DELETE SET NULL,
  CONSTRAINT "Vehicle_submittedBy_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Vehicle_plate_state_unique" UNIQUE ("plate", "state")
);

CREATE TABLE "Report" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "incidentId" UUID NOT NULL,
  "authorId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "bodyRtf" TEXT NOT NULL,
  "revisionsJson" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "approvedById" UUID,
  "subjectPersonId" UUID,
  CONSTRAINT "Report_incident_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_author_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_approver_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL,
  CONSTRAINT "Report_subject_fkey" FOREIGN KEY ("subjectPersonId") REFERENCES "Person"("id") ON DELETE SET NULL
);

CREATE TABLE "Citation" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "personId" UUID NOT NULL,
  "officerId" UUID NOT NULL,
  "violations" JSONB NOT NULL,
  "location" TEXT NOT NULL,
  "fineTotal" DOUBLE PRECISION NOT NULL,
  "courtDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Citation_person_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE,
  CONSTRAINT "Citation_officer_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Arrest" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "personId" UUID NOT NULL,
  "incidentId" UUID NOT NULL,
  "officerId" UUID NOT NULL,
  "charges" JSONB NOT NULL,
  "bookedAt" TIMESTAMP WITH TIME ZONE,
  "releaseStatus" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Arrest_person_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE,
  CONSTRAINT "Arrest_incident_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE,
  CONSTRAINT "Arrest_officer_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Warrant" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "personId" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  CONSTRAINT "Warrant_person_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE
);

CREATE TABLE "Bolo" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "category" TEXT NOT NULL,
  "subjectRef" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "lastSeenLocation" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "createdById" UUID NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "Bolo_creator_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Evidence" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "incidentId" UUID NOT NULL,
  "tag" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT,
  "custodyLogJson" JSONB NOT NULL DEFAULT '[]'::JSONB,
  CONSTRAINT "Evidence_incident_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "actorId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "diffJson" JSONB NOT NULL,
  "at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuditLog_actor_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Notification" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "readAt" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "Notification_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
