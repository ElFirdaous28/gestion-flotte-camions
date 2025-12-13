import AppRoutes from './routes/AppRoutes';
import { lazy, Suspense } from 'react';

const ToastContainer = lazy(() =>
  import('react-toastify').then((module) => ({ default: module.ToastContainer }))
);

function App() {
  return (
    <>
      <AppRoutes />

      <Suspense fallback={null}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Suspense>
    </>
  );
}

export default App;
