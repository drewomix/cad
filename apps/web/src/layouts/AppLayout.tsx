import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', roles: ['*'] },
  { to: '/citizen', label: 'Citizen Portal', roles: ['CITIZEN', 'RECORDS', 'SUPERVISOR', 'ADMIN'] },
  { to: '/dispatch', label: 'Dispatcher', roles: ['DISPATCHER', 'SUPERVISOR', 'ADMIN'] },
  { to: '/mdt', label: 'Officer MDT', roles: ['OFFICER', 'SUPERVISOR', 'ADMIN'] },
  { to: '/admin', label: 'Admin', roles: ['SUPERVISOR', 'ADMIN'] }
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const items = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => item.roles.includes('*') || item.roles.includes(user.role));
  }, [user]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="w-64 border-r border-slate-900 bg-slate-950/60 p-6">
        <div className="text-xl font-semibold tracking-tight">Sentinel CAD</div>
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => {
                const active = item.to === '/' ? isActive : location.pathname.startsWith(item.to);
                return `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-blue-600/20 text-blue-200' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`;
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-900 bg-slate-950/80 px-6 py-4">
          <div>
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="text-lg font-semibold">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/citizen" className="text-sm text-blue-300 hover:underline">
              Citizen Self-Service
            </Link>
            <Button variant="outline" onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </header>
        <div className="p-6 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
