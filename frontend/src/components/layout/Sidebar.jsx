import React, { useState } from 'react';
import {
  Home,
  Users,
  ChevronsRight,
  ChevronsLeft,
  Truck,
  FileText,
  Settings,
  Calendar,
  Wrench,
} from 'lucide-react';
import { PiTireThin } from "react-icons/pi";
import { FaTrailer } from "react-icons/fa";

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Logo from './Logo';

function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = {
    driver: [
      { title: 'Dashboard', path: '/driver/dashboard', icon: Home },
      { title: 'My Trips', path: '/driver/trips', icon: Calendar },
      { title: 'Profile', path: '/profile', icon: Users }, // or User icon
    ],

    admin: [
      { title: 'Dashboard', path: '/admin/dashboard', icon: Home },
      { title: 'Users', path: '/admin/users', icon: Users },
      { title: 'Trucks', path: '/admin/trucks', icon: Truck },
      { title: 'Trailers', path: '/admin/trailers', icon: FaTrailer },
      { title: 'Tires', path: '/admin/tires', icon: PiTireThin },
      { title: 'Trips', path: '/admin/trips', icon: Calendar },
      { title: 'Maintenance Rules', path: '/admin/maintenance/rules', icon: Settings },
      { title: 'Maintenance', path: '/admin/maintenance', icon: Wrench },
      { title: 'Reports', path: '/admin/reports', icon: FileText },
      { title: 'Profile', path: '/profile', icon: Users }, // optional
    ],
  };

  const roleLinks = links[user?.role] || [];
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

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
              <img className="w-10" src="/images/logo.svg" alt="logo" />
            </div>

            <div className="flex flex-col">
              <Logo isExpanded={isExpanded} />

              {/* Slanted Badge */}
              {user?.role && isExpanded && (
                <span className={`text-xs py-0.5 rounded-full capitalize tracking-wider text-text-muted`}>
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 shadow-[0_6px_-1px_rgba(0,0,0,0.4)] border-r border-border">
            {/* Navigation: flex-1 allows it to grow/scroll within the parent */}
            <nav className="space-y-2 flex-1 p-4 overflow-y-auto">
              {roleLinks.map(({ title, path, icon: Icon }) => {
                const isActive = pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg ${isActive ? 'bg-primary text-white [text-shadow:0_0_2px_rgba(0,0,0,0.8)]' : 'text-text-muted hover:bg-primary hover:text-white'}`}>
                    <Icon className="w-5 h-5 min-w-5" />
                    <span
                      className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                      {title}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className={`flex p-4 mt-auto ${isExpanded ? 'justify-end' : 'justify-center'}`}>
              <button
                aria-label="Toggle Expand Sidebar"
                onClick={toggleExpanded}
                className="flex items-center justify-center w-10 h-10 border border-primary text-primary hover:bg-primary hover:text-secondary rounded-lg">
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