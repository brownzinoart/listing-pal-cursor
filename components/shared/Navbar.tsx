import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../constants';
import { BuildingStorefrontIcon, ArrowRightOnRectangleIcon, PlusIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-brand-panel shadow-lg border-b border-brand-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center h-full">
            <div className="h-12 w-auto flex items-center">
              <img
                src="/logo.png"
                alt="ListingPal Logo"
                className="object-contain max-h-full max-w-[120px]"
              />
            </div>
          </Link>
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-brand-text-secondary hover:text-brand-text-primary transition-colors font-medium py-2 px-3 text-sm rounded-md hover:bg-brand-card"
                >
                  Login
                </Link>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;