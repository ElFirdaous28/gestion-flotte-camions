import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success('Logged out successfully!');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Logout failed!');
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-start gap-2 text-red-500 font-semibold px-4 py-2 rounded-lg hover:bg-border transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
};

export default LogoutButton;
