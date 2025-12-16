import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import Test from '../pages/app/Test';
import AdminRoutes from './AdminRoutes';
import DriverRoutes from './DriverRoutes';
import PublicRoute from './PublicRoute';

// Lazy load pages
const Layout = lazy(() => import('../layout/Layout'));
const Login = lazy(() => import('../pages/auth/Login'));
const NotFound = lazy(() => import('../pages/app/NotFound'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />} >
            {/* Login route */}
            <Route path='/login' element={<Login />} />
          </Route>

          {/* routes tking layou */}
          <Route path="/" element={<Layout />}>
            <Route path='/test' element={<Test />} />

            {/* admin routes */}
            {AdminRoutes()}

            {/* driver routes */}
            {DriverRoutes()}

          </Route>

          {/* catche unauthorized routes */}
          <Route path="/unauthorized" element="unauthorized" />
          {/* catche not found routes */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
