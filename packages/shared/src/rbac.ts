import type { Role } from './index.js';

type Permission =
  | 'citizen:create'
  | 'citizen:view'
  | 'records:approve'
  | 'incident:manage'
  | 'unit:status'
  | 'report:submit'
  | 'report:approve'
  | 'bolo:manage'
  | 'admin:manage'
  | 'audit:view';

const roleMatrix: Record<Role, Permission[]> = {
  CITIZEN: ['citizen:create'],
  OFFICER: ['citizen:view', 'incident:manage', 'unit:status', 'report:submit', 'bolo:manage'],
  DISPATCHER: ['incident:manage', 'unit:status', 'bolo:manage', 'audit:view'],
  SUPERVISOR: [
    'citizen:view',
    'records:approve',
    'incident:manage',
    'unit:status',
    'report:approve',
    'bolo:manage',
    'audit:view'
  ],
  ADMIN: [
    'citizen:view',
    'records:approve',
    'incident:manage',
    'unit:status',
    'report:approve',
    'bolo:manage',
    'admin:manage',
    'audit:view'
  ],
  RECORDS: ['citizen:view', 'records:approve', 'audit:view']
};

export const hasPermission = (role: Role, permission: Permission) =>
  roleMatrix[role]?.includes(permission) ?? false;

export const getPermissions = (role: Role) => roleMatrix[role] ?? [];
