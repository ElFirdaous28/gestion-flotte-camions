import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
import Test from '../pages/app/Test';
import AdminRoutes from './AdminRoutes';
import ProtectedRoute from './ProtectedRoute';
const Layout = lazy(() => import('../layout/Layout'));
const Login = lazy(() => import('../pages/auth/Login'));
const NotFound = lazy(() => import('../pages/app/NotFound'));

// Lazy load pages

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Login route */}
          <Route path='/login' element={<Login />} />

          {/* routes tking layou */}
          <Route path="/" element={<Layout />}>
            <Route path='/test' element={<Test />} />

            {/* admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>{AdminRoutes()}</Route>

          </Route>

          {/* catche not unauthorized routes */}
          <Route path="/unauthorized" element="unauthorized" />
          {/* catche not found routes */}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
