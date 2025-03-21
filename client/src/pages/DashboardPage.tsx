import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "wouter";
import { 
  Briefcase, 
  CheckCircle, 
  File, 
  Eye, 
  Plus, 
  Edit, 
  Trash2
} from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, fetchStats, deleteJob } from "@/store/jobsSlice";
import Layout from "@/components/layout/Layout";
import { StatCard } from "@/components/ui/stat-card";
import { JobCard } from "@/components/ui/job-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, stats, loading } = useSelector((state: RootState) => state.jobs);
  const { isCompany, isCandidate, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchStats());
    
    // For companies, fetch only their jobs
    if (isCompany && user?.id) {
      dispatch(fetchJobs());
    } else {
      // For candidates, fetch all active jobs
      dispatch(fetchJobs());
    }
  }, [dispatch, isCompany, isCandidate, user?.id]);

  const handleDeleteJob = async (jobId: number) => {
    try {
      await dispatch(deleteJob(jobId));
      toast({
        title: "Job deleted",
        description: "The job listing has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout requireAuth>
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isCompany ? "Manage your job listings and applications" : "Find and track your job applications"}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          footerLink={{ label: "View all", href: isCompany ? "/dashboard" : "/" }}
        />
        
        <StatCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={CheckCircle}
          iconColor="text-emerald-600 dark:text-emerald-500"
          footerLink={{ label: "View active", href: "/dashboard" }}
        />
        
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon={File}
          iconColor="text-amber-600 dark:text-amber-500"
          footerLink={{ label: "View applications", href: "/applications" }}
        />
        
        <StatCard
          title="Views"
          value={stats.viewCount}
          icon={Eye}
          iconColor="text-violet-600 dark:text-violet-500"
          footerLink={{ label: "View analytics", href: "#" }}
        />
      </div>

      {/* Content based on user type */}
      {isCompany ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Your Job Listings</CardTitle>
            <Button asChild>
              <Link href="/post-job">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                    <div className="mr-4">
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.location}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          job.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => navigate(`/post-job?edit=${job.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the job listing 
                              and remove it from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteJob(job.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No jobs posted yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by posting your first job listing</p>
                <Button className="mt-4" asChild>
                  <Link href="/post-job">Post a Job</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Job Listings</h2>
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 h-64"></CardContent>
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {jobs.slice(0, 3).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  We couldn't find any jobs matching your criteria. Try adjusting your search or check back later.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/">Browse All Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {jobs.length > 0 && (
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/">View All Jobs</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
