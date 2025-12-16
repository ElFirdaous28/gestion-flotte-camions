import { Route } from 'react-router-dom';
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

const Dashboard = lazy(() => import('../pages/driver/Dashboard'));
const ChangePassword = lazy(() => import('../pages/driver/ChangePassword'));
const Trips = lazy(() => import('../pages/admin/Trips'));

export default function DriverRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
      <Route path="/driver/dashboard" element={<Dashboard />} />
      <Route path="/driver/change-password" element={<ChangePassword />} />
      <Route path="/driver/trips" element={<Trips />} />
    </Route>
  );
}
