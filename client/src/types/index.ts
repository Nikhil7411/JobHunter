import { User, Job, Application } from '@shared/schema';

// Extended types for UI
export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface JobWithCompany extends Job {
  companyDetails?: UserWithoutPassword;
}

export interface ApplicationWithDetails extends Application {
  job?: Job;
  candidate?: UserWithoutPassword;
}

// Theme type
export type Theme = 'light' | 'dark' | 'system';

// Navigation item
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  active?: boolean;
}
