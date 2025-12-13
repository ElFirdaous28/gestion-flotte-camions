import { lazy, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = lazy(() => import('../components/Sidebar'));
const Header = lazy(() => import('../components/Header'));
const Footer = lazy(() => import('../components/Footer'));

export default function Layout() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // 1. Main Layout Container (Full Screen, No Body Scroll)
    <div className="flex h-screen bg-background overflow-hidden w-full">
      {user && <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}

      {/* 2. Right Side Column */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Header toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div className="flex-1 overflow-y-auto scroll-smooth hide-scrollbar flex flex-col">
          {/* Flex-1 pushes footer to bottom if content is short */}
          <main className="flex-1 p-4 md:p-8 flex items-center justify-center flex-col">
            <Outlet />
          </main>

          {!user && <Footer />}
        </div>
      </div>
    </div>
  );
}
