import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { lazy, Suspense } from 'react';
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
