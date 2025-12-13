import { Facebook, Instagram, Linkedin } from 'lucide-react';
import React, { lazy } from 'react';
import { Link } from 'react-router-dom';
const Logo = lazy(() => import('./Logo'));

function Footer() {
  return (
    <footer className="mt-20 bg-background border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.4)] z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Logo />
            <p className="mt-4 text-text-muted text-sm max-w-xs">
              The best place to shop for high-quality products at the best prices.
            </p>
          </div>

          <div>
            <p role="heading" aria-level="2" className="text-lg font-semibold text-text">
              Quick Links
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p role="heading" aria-level="2" className="text-lg font-semibold text-text">
              Customer Service
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/" className="text-text-muted hover:text-text text-sm">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p role="heading" aria-level="2" className="text-lg font-semibold text-text">
              Newsletter
            </p>
            <p className="mt-4 text-text-muted text-sm">Get special offers and updates.</p>
            <button className="mt-4 text-text px-5 py-2 rounded-lg font-semibold  border border-primary hover:bg-primary transition-colors text-sm">
              Sign Up
            </button>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500">&copy; 2024 E-Market. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/" aria-label="Instagram" className="text-text-muted hover:text-text">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link to="/" aria-label="LinkedIn" className="text-text-muted hover:text-text">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link to="/" aria-label="Facebook" className="text-text-muted hover:text-text">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
