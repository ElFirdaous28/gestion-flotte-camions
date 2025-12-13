import { User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import DarkToggel from './DarkToggel';
import React, { lazy, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
const Logo = lazy(() => import('./Logo'));

function Header({ toggleMobileMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();

  const dropdownRef = useRef(null);

  return (
    <header className="bg-background border-b border-border shadow-sm h-20 shrink-0 z-30 relative">
      <nav className="w-full h-full px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-4">
          {user &&
            <button onClick={toggleMobileMenu} className="md:hidden p-2 hover:bg-surface rounded-md">
              <Menu className="h-6 w-6 text-text" />
            </button>
          }

          <div className="w-8 h-8 md:w-11 md:h-11 bg-primary rounded-lg shrink-0 flex items-center justify-center font-bold text-xl text-white">
            <img className="w-10" src="/images/logo.svg" alt="logo" />
          </div>
          {!user &&
            <Logo className="hidden md:flex" />
          }
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <DarkToggel />

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
