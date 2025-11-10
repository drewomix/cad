export type Role =
  | 'CITIZEN'
  | 'OFFICER'
  | 'DISPATCHER'
  | 'SUPERVISOR'
  | 'ADMIN'
  | 'RECORDS';

export type DutyStatus = 'OFF' | 'AVAILABLE' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORT' | 'CODE4' | 'UNAVAILABLE';

export const DutyStatusHotkeys: Record<DutyStatus, string> = {
  OFF: 'X',
  AVAILABLE: 'A',
  EN_ROUTE: 'E',
  ON_SCENE: 'O',
  TRANSPORT: 'T',
  CODE4: 'C4',
  UNAVAILABLE: 'UC'
};

export type IncidentPriority = 1 | 2 | 3 | 4;

export type IncidentStatus = 'OPEN' | 'ASSIGNED' | 'ON_SCENE' | 'CLOSED';

export type ReportType = 'FI' | 'INCIDENT' | 'CITATION' | 'ARREST' | 'CRASH';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type SocketEvent =
  | 'unit:status.update'
  | 'incident:created'
  | 'incident:updated'
  | 'incident:closed'
  | 'dispatch:assign'
  | 'dispatch:unassign'
  | 'bolo:created'
  | 'bolo:updated'
  | 'bolo:cleared'
  | 'report:submitted'
  | 'report:approved'
  | 'report:rejected';

export const SOCKET_EVENT_NAMESPACE = '/realtime';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export * from './validation';
export * from './rbac';
export * from './geo';
