import { Link, useLocation } from 'wouter';
import { Home, Briefcase, Users, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { NavItem } from '@/types';

export default function MobileNavigation() {
  const [location] = useLocation();
  const { isAuthenticated, isCompany, isCandidate } = useAuth();

  // Define navigation items based on user type
  let navigationItems: NavItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Jobs', href: '/dashboard', icon: Briefcase },
  ];

  if (isAuthenticated) {
    if (isCompany) {
      navigationItems.push(
        { name: 'Applications', href: '/applications', icon: Users },
      );
    } else if (isCandidate) {
      navigationItems.push(
        { name: 'Applications', href: '/applications', icon: Users },
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.slice(0, 5).map((item) => (
          <Link 
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center ${
              item.active 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
