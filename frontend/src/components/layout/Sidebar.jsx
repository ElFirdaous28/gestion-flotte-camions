import React, { useState } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  ChevronsRight,
  ChevronsLeft,
  User,
  History,
  Tickets,
  Star,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = {
    user: [
      { title: 'Home', path: '/', icon: Home },
      { title: 'Products', path: '/products', icon: Package },
      { title: 'Cart', path: '/cart', icon: ShoppingCart },
      { title: 'Orders', path: '/orders', icon: ShoppingCart },
      { title: 'Profile', path: '/profile', icon: User },
    ],

    seller: [
      { title: 'Dashboard', path: '/seller/overview', icon: Home },
      { title: 'My Products', path: '/seller/products', icon: Package },
      { title: 'Orders', path: '/seller/orders', icon: ShoppingCart },
      { title: 'coupons', path: '/seller/coupons', icon: Tickets },
    ],

    admin: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: Home },
      { title: 'Users', path: '/admin/usermanage', icon: Users },
      { title: 'Products', path: '/admin/productmanage', icon: Package },
      { title: 'Reviews', path: '/admin/reviews', icon: Star },
      { title: 'Activities', path: '/admin/activities', icon: History },
      // { title: "Analytics", path: "/analytics", icon: BarChart3 },
      { title: 'Profile', path: '/profile', icon: User },
    ],
  };

  const roleLinks = links[user?.role] || [];
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const roleStyles = {
    admin: 'bg-red-200 text-red-800 border-red-300',
    seller: 'bg-blue-200 text-blue-800 border-blue-300',
    user: 'bg-green-200 text-green-800 border-green-300',
  };

  const badgeClass = user?.role ? roleStyles[user.role] : '';

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          /* BASE STYLES */
          bg-background z-40 transition-all duration-300 overflow-hidden flex flex-col
          
          /* MOBILE: Fixed position, slide-in logic */
          fixed inset-y-0 left-0 h-full
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}

          /* DESKTOP: Relative position (part of flex row), always visible */
          md:translate-x-0 md:relative md:inset-auto 
          
          /* WIDTH LOGIC (Both Mobile & Desktop) */
          ${isExpanded ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Branding Section */}
          <div
            className={`flex items-center gap-2 h-20 pl-4 border-b border-border shadow-sm transition-all duration-300 ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <div className="w-11 h-11 bg-primary rounded-lg shrink-0 flex items-center justify-center font-bold text-xl text-white">
              E{/* <img className="w-10" src="/logo.svg" alt="logo" /> */}
            </div>
            <span
              className={`text-xl font-semibold text-text whitespace-nowrap transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}
            >
              E-Market
            </span>

            {/* Slanted Badge */}
            {user?.role && isExpanded && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize tracking-wider ${badgeClass}`}
              >
                {user.role}
              </span>
            )}
          </div>

          {/* FIX: Added 'flex-1 flex flex-col min-h-0' here. 
              This forces the container to take all remaining height, ensuring the border goes to the bottom. */}
          <div className="flex-1 flex flex-col min-h-0 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.4)] border-r border-border">
            {/* Navigation: flex-1 allows it to grow/scroll within the parent */}
            <nav className="space-y-2 flex-1 p-4 overflow-y-auto">
              {roleLinks.map(({ title, path, icon: Icon }) => {
                const isActive = pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? 'bg-primary text-white [text-shadow:0_0_2px_rgba(0,0,0,0.8)]' : 'text-text-muted hover:bg-primary hover:text-white'}`}
                  >
                    <Icon className="w-5 h-5 min-w-5" />
                    <span
                      className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
                    >
                      {title}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Toggle Button: Added padding for spacing from bottom/sides */}
            <div className={`flex p-4 mt-auto ${isExpanded ? 'justify-end' : 'justify-center'}`}>
              <button
                aria-label="Toggle Expand Sidebar"
                onClick={toggleExpanded}
                className="flex items-center justify-center w-10 h-10 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg"
              >
                {isExpanded ? (
                  <ChevronsLeft className="w-5 h-5" />
                ) : (
                  <ChevronsRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default React.memo(Sidebar)