import { Route } from 'react-router-dom';
import { lazy } from 'react';
 
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin/dashboard" element={<Dashboard />} />
    </>
  );
}
