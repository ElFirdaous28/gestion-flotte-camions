import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from './LogoutButton';
import DarkToggel from './DarkToggel';
import { useCart } from '../hooks/useCart';
import React, { lazy, useRef, useState } from 'react';
const Logo = lazy(() => import('./Logo'));

function Header({ toggleMobileMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();
  const { cartLength } = useCart();

  const dropdownRef = useRef(null);

  return (
    <header className="bg-background border-b border-border shadow-sm h-20 shrink-0 z-30 relative">
      <nav className="w-full h-full px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={toggleMobileMenu} className="md:hidden p-2 hover:bg-surface rounded-md">
            <Menu className="h-6 w-6 text-text" />
          </button>
          {!user && <Logo className="hidden md:flex" />}
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block w-full md:max-w-[20rem] lg:max-w-md">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search Products..."
              className="bg-brand-surface text-sm text-text w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-primary border border-border"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <DarkToggel />
          {(!user || user.role === 'user') && (
            <Link to="/cart" className="relative text-text-muted hover:text-text">
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {cartLength}
              </span>
            </Link>
          )}

          {/* User Section */}
          <div onMouseLeave={() => setDropdownOpen(false)} ref={dropdownRef} className="relative">
            {user ? (
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                {user.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <User className="w-10 h-10 bg-surface rounded-full p-2" />
                )}
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-text">{user.fullname}</div>
                  <div className="text-xs text-text">{user.email}</div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white [text-shadow:0_0_2px_rgba(0,0,0,0.8)] rounded-md"
              >
                Sign In
              </Link>
            )}

            {dropdownOpen && user && (
              <div className="absolute right-0 top-10 w-32 bg-surface rounded-md shadow-lg overflow-hidden z-20">
                <Link
                  to="/profile"
                  className="w-full block px-4 py-2 text-text-muted hover:bg-border"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>

                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default React.memo(Header);
