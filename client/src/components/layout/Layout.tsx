import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '@/hooks/use-auth';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function Layout({ children, requireAuth = false }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [location, setLocation] = useLocation();

  // If authentication is required but user is not authenticated, redirect to login
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      setLocation('/login');
    }
  }, [requireAuth, isAuthenticated, setLocation]);

  // Determine if we should show the sidebar based on authentication status
  const showNavigation = !requireAuth || (requireAuth && isAuthenticated);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar for desktop */}
      {showNavigation && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 overflow-auto ${showNavigation ? 'md:ml-64' : ''}`}>
        {/* Header */}
        {showNavigation && <Header />}

        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {showNavigation && <MobileNavigation />}
    </div>
  );
}
