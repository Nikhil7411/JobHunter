import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { 
  loginSchema, registerSchema, insertJobSchema, insertApplicationSchema,
  User, InsertUser, Job, InsertJob, Application, InsertApplication
} from '@shared/schema';
import { storage } from "./storage";
import { 
  hashPassword, comparePasswords, generateToken, 
  authenticate, isCompany, isCandidate 
} from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix with /api
  const apiRouter = app.route('/api');
  
  // Auth Routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user without the confirmPassword field
      const { confirmPassword, ...userDataToSave } = userData;
      const user = await storage.createUser({
        ...userDataToSave,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user info (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const credentials = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(credentials.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Compare passwords
      const passwordMatch = await comparePasswords(credentials.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user info (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to authenticate user' });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user info without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });
  
  // Job Routes
  app.get('/api/jobs', async (req: Request, res: Response) => {
    try {
      const { search, location, type, tags } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (location) filters.location = location as string;
      if (type) filters.type = type as string;
      if (tags) filters.tags = (tags as string).split(',');
      
      // Only get active jobs for public listing
      filters.isActive = true;
      
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  });
  
  app.get('/api/jobs/:id', async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      res.json(job);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch job details' });
    }
  });
  
  app.post('/api/jobs', authenticate, isCompany, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const jobData = insertJobSchema.parse(req.body);
      
      // Create job with the current user as the owner
      const job = await storage.createJob({
        ...jobData,
        userId: req.user.id
      });
      
      res.status(201).json(job);
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to create job' });
    }
  });
  
  app.put('/api/jobs/:id', authenticate, isCompany, async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      
      // Check if job exists and belongs to the user
      const existingJob = await storage.getJob(jobId);
      if (!existingJob) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      if (existingJob.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this job' });
      }
      
      // Update job
      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to update job' });
    }
  });
  
  app.delete('/api/jobs/:id', authenticate, isCompany, async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      
      // Check if job exists and belongs to the user
      const existingJob = await storage.getJob(jobId);
      if (!existingJob) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      if (existingJob.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to delete this job' });
      }
      
      // Delete job
      await storage.deleteJob(jobId);
      res.status(204).send();
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete job' });
    }
  });
  
  // Application Routes
  app.get('/api/applications', authenticate, async (req: Request, res: Response) => {
    try {
      const { jobId } = req.query;
      let applications: Application[] = [];
      
      if (req.user.type === 'company') {
        // Companies can see applications for their jobs
        const userJobs = await storage.getJobsByUser(req.user.id);
        const jobIds = userJobs.map(job => job.id);
        
        if (jobId) {
          // Check if the job belongs to the company
          const parsedJobId = parseInt(jobId as string, 10);
          if (!jobIds.includes(parsedJobId)) {
            return res.status(403).json({ message: 'You do not have permission to view these applications' });
          }
          
          applications = await storage.getApplications(parsedJobId);
        } else {
          // Get all applications for all company jobs
          applications = [];
          for (const id of jobIds) {
            const jobApplications = await storage.getApplications(id);
            applications = [...applications, ...jobApplications];
          }
        }
      } else {
        // Candidates can see their own applications
        applications = await storage.getApplications(undefined, req.user.id);
      }
      
      res.json(applications);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch applications' });
    }
  });
  
  app.post('/api/jobs/:id/apply', authenticate, isCandidate, async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id, 10);
      
      // Check if job exists and is active
      const job = await storage.getJob(jobId);
      if (!job || !job.isActive) {
        return res.status(404).json({ message: 'Job not found or not active' });
      }
      
      // Validate request body
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Check if user already applied
      const existingApplications = await storage.getApplications(jobId, req.user.id);
      if (existingApplications.length > 0) {
        return res.status(409).json({ message: 'You have already applied for this job' });
      }
      
      // Create application
      const application = await storage.createApplication({
        ...applicationData,
        jobId,
        userId: req.user.id
      });
      
      res.status(201).json(application);
      
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: 'Failed to submit application' });
    }
  });
  
  app.put('/api/applications/:id/status', authenticate, isCompany, async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id, 10);
      const { status } = req.body;
      
      if (!status || !['pending', 'reviewed', 'interviewed', 'rejected', 'accepted'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      // Get the application
      const application = await storage.getApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      // Check if the job belongs to the company
      const job = await storage.getJob(application.jobId);
      if (!job || job.userId !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to update this application' });
      }
      
      // Update application status
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      res.json(updatedApplication);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to update application status' });
    }
  });
  
  // Stats Route
  app.get('/api/stats', authenticate, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });
  
  // User Profile Routes
  app.put('/api/profile', authenticate, async (req: Request, res: Response) => {
    try {
      // Don't allow updating email or password through this endpoint
      const { email, password, type, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user info without password
      const { password: userPassword, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
