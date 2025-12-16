import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        return user.role === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/driver/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
 