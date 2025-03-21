import { Link, useLocation } from 'wouter';
import { Home, Briefcase, Users, User, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { NavItem } from '@/types';

export default function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated, user, isCompany, isCandidate, logout } = useAuth();

  // Define navigation items based on user type
  let navigationItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/', icon: Briefcase },
  ];

  if (isAuthenticated) {
    if (isCompany) {
      navigationItems.push(
        { name: 'Applications', href: '/applications', icon: Users },
      );
    } else if (isCandidate) {
      navigationItems.push(
        { name: 'My Applications', href: '/applications', icon: Users },
      );
    }
    
    navigationItems.push(
      { name: 'Profile', href: '/profile', icon: User },
      { name: 'Settings', href: '/settings', icon: Settings },
    );
  }

  // Mark the active navigation item
  navigationItems = navigationItems.map(item => ({
    ...item,
    active: location === item.href
  }));

  return (
    <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 dark:bg-gray-800 bg-white border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-2 text-xl font-semibold">JobConnect</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              item.active 
                ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${
              item.active 
                ? 'text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`} />
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ThemeToggle />
        
        {isAuthenticated && (
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
