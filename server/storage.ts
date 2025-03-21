import { 
  User, InsertUser, 
  Job, InsertJob, 
  Application, InsertApplication 
} from '@shared/schema';

// Storage interface defining CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Job operations
  getJobs(filters?: JobFilters): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  getJobsByUser(userId: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<Job>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  // Application operations
  getApplications(jobId?: number, userId?: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Stats operations
  getStats(userId?: number): Promise<Stats>;
}

// Types for filtering jobs
export interface JobFilters {
  search?: string;
  location?: string;
  type?: string;
  tags?: string[];
  userId?: number;
  isActive?: boolean;
}

// Stats interface for dashboard
export interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  viewCount: number;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private applications: Map<number, Application>;
  private userIdCounter: number;
  private jobIdCounter: number;
  private applicationIdCounter: number;
  private viewCounts: Map<number, number>; // Track job view counts

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.viewCounts = new Map();
    this.userIdCounter = 1;
    this.jobIdCounter = 1;
    this.applicationIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Job operations
  async getJobs(filters: JobFilters = {}): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values());
    
    // Apply filters
    if (filters.search) {
      const search = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search)
      );
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase();
      jobs = jobs.filter(job => job.location.toLowerCase().includes(location));
    }
    
    if (filters.type) {
      jobs = jobs.filter(job => job.type === filters.type);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      jobs = jobs.filter(job => 
        job.tags && filters.tags!.some(tag => job.tags!.includes(tag))
      );
    }
    
    if (filters.userId !== undefined) {
      jobs = jobs.filter(job => job.userId === filters.userId);
    }
    
    if (filters.isActive !== undefined) {
      jobs = jobs.filter(job => job.isActive === filters.isActive);
    }
    
    // Sort by creation date (newest first)
    return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getJob(id: number): Promise<Job | undefined> {
    // Increment view count when a job is viewed
    const viewCount = this.viewCounts.get(id) || 0;
    this.viewCounts.set(id, viewCount + 1);
    
    return this.jobs.get(id);
  }

  async getJobsByUser(userId: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createJob(job: InsertJob): Promise<Job> {
    const id = this.jobIdCounter++;
    const now = new Date();
    const newJob: Job = { 
      ...job, 
      id, 
      createdAt: now,
      isActive: job.isActive !== undefined ? job.isActive : true
    };
    this.jobs.set(id, newJob);
    this.viewCounts.set(id, 0);
    return newJob;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...jobData };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Application operations
  async getApplications(jobId?: number, userId?: number): Promise<Application[]> {
    let applications = Array.from(this.applications.values());
    
    if (jobId !== undefined) {
      applications = applications.filter(app => app.jobId === jobId);
    }
    
    if (userId !== undefined) {
      applications = applications.filter(app => app.userId === userId);
    }
    
    return applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const newApplication: Application = { 
      ...application, 
      id, 
      createdAt: now,
      status: "pending" 
    };
    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, status };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Stats operations
  async getStats(userId?: number): Promise<Stats> {
    let relevantJobs = Array.from(this.jobs.values());
    let relevantApplications = Array.from(this.applications.values());
    
    if (userId !== undefined) {
      // For company users, filter jobs they posted
      if (this.users.get(userId)?.type === 'company') {
        relevantJobs = relevantJobs.filter(job => job.userId === userId);
        // Get applications for their jobs
        const jobIds = relevantJobs.map(job => job.id);
        relevantApplications = relevantApplications.filter(app => jobIds.includes(app.jobId));
      } else {
        // For candidates, get applications they submitted
        relevantApplications = relevantApplications.filter(app => app.userId === userId);
      }
    }
    
    // Calculate total view count
    let viewCount = 0;
    if (userId !== undefined && this.users.get(userId)?.type === 'company') {
      // For companies, only count views on their jobs
      relevantJobs.forEach(job => {
        viewCount += this.viewCounts.get(job.id) || 0;
      });
    } else {
      // Total view count across all jobs
      Array.from(this.viewCounts.values()).forEach(count => {
        viewCount += count;
      });
    }
    
    return {
      totalJobs: relevantJobs.length,
      activeJobs: relevantJobs.filter(job => job.isActive).length,
      totalApplications: relevantApplications.length,
      viewCount
    };
  }
}

export const storage = new MemStorage();
