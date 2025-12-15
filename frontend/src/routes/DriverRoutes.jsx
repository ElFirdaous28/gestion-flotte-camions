import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/driver/Dashboard'));
const ChangePassword = lazy(() => import('../pages/driver/ChangePassword'));

export default function AdminRoutes() {
  return (
    <>
      <Route path="/driver/dashboard" element={<Dashboard />} />
      <Route path="/driver/change-password" element={<ChangePassword />} />
    </>
  );
}
