import { z } from 'zod';

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(64);

export const personSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date'),
  sex: z.string().min(1),
  race: z.string().min(1),
  heightCm: z.number().min(50).max(250),
  weightKg: z.number().min(30).max(250),
  dlNumber: z.string().min(4).max(32).optional(),
  flags: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional()
});

export const vehicleSchema = z.object({
  plate: z.string().regex(/^[A-Z0-9]{1,8}$/i),
  state: z.string().min(2).max(2),
  vin: z.string().min(5).max(17).optional(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  insuranceStatus: z.enum(['VALID', 'EXPIRED', 'UNKNOWN']).default('UNKNOWN')
});

export const incidentSchema = z.object({
  priority: z.number().min(1).max(4),
  type: z.string().min(1),
  address: z.string().min(1),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  narrative: z.string().min(1)
});

export const citationSchema = z.object({
  personId: z.string().min(1),
  violations: z.array(z.string()).min(1),
  location: z.string().min(1),
  fineTotal: z.number().min(0),
  courtDate: z.string().optional()
});

export const arrestSchema = z.object({
  personId: z.string().min(1),
  charges: z.array(z.string()).min(1),
  bookedAt: z.string().optional(),
  releaseStatus: z.string().optional()
});

export const boloSchema = z.object({
  category: z.enum(['PERSON', 'VEHICLE', 'PLACE']),
  subjectRef: z.string().min(1),
  description: z.string().min(1),
  lastSeenLocation: z.string().optional(),
  expiresAt: z.string().optional()
});

export const reportSchema = z.object({
  incidentId: z.string().min(1),
  type: z.enum(['FI', 'INCIDENT', 'CITATION', 'ARREST', 'CRASH']),
  bodyRtf: z.string().min(1)
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20)
});

export type PersonInput = z.infer<typeof personSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type CitationInput = z.infer<typeof citationSchema>;
export type ArrestInput = z.infer<typeof arrestSchema>;
export type BoloInput = z.infer<typeof boloSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
