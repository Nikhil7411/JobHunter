import { ReactNode } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  footerLink?: {
    label: string;
    href: string;
  };
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-primary-600 dark:text-primary-500',
  footerLink,
  onClick
}: StatCardProps) {
  return (
    <Card className="overflow-hidden" onClick={onClick}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {footerLink && (
        <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <a 
              href={footerLink.href} 
              className={`font-medium ${iconColor} hover:opacity-80`}
            >
              {footerLink.label}
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
