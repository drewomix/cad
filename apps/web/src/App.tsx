import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CitizenPortal from '@/features/citizen/CitizenPortal';
import DispatchConsole from '@/features/dispatch/DispatchConsole';
import OfficerMdt from '@/features/mdt/OfficerMdt';
import AdminSuite from '@/features/admin/AdminSuite';
import AppLayout from '@/layouts/AppLayout';

const RequireAuth = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  useEffect(() => {
    if (!initialized) {
      void useAuthStore.getState().fetchMe();
    }
  }, [initialized]);

  if (!initialized) {
    return <div className="flex h-screen items-center justify-center text-slate-300">Loading session…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const { user, initialized } = useAuthStore();
  useEffect(() => {
    if (!initialized) {
      void useAuthStore.getState().fetchMe();
    }
  }, [initialized]);
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="citizen"
          element={
            <RequireAuth roles={['CITIZEN', 'RECORDS', 'SUPERVISOR', 'ADMIN']}>
              <CitizenPortal />
            </RequireAuth>
          }
        />
        <Route
          path="dispatch"
          element={
            <RequireAuth roles={['DISPATCHER', 'SUPERVISOR', 'ADMIN']}>
              <DispatchConsole />
            </RequireAuth>
          }
        />
        <Route
          path="mdt"
          element={
            <RequireAuth roles={['OFFICER', 'SUPERVISOR', 'ADMIN']}>
              <OfficerMdt />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['SUPERVISOR', 'ADMIN']}>
              <AdminSuite />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}
