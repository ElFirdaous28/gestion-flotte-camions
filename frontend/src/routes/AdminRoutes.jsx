import { Route } from 'react-router-dom';
import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Users = lazy(() => import('../pages/admin/Users'));
const Trucks = lazy(()=>import('../pages/admin/Trucks'))

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/trucks" element={<Trucks />} />
    </>
  );
}
