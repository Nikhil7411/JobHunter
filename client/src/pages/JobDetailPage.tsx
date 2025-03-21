import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "wouter";
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar,
  ArrowLeft,
  Building
} from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { fetchJobById, clearCurrentJob } from "@/store/jobsSlice";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApplicationForm from "@/components/jobs/ApplicationForm";
import { useAuth } from "@/hooks/use-auth";
import { Job } from "@shared/schema";

export default function JobDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentJob, loading } = useSelector((state: RootState) => state.jobs);
  const { isAuthenticated, isCandidate } = useAuth();
  const [location, params] = useLocation();
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  
  // Extract job ID from URL
  const jobId = params ? parseInt(params.split('/').pop() || '0', 10) : 0;

  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
    }

    // Cleanup function
    return () => {
      dispatch(clearCurrentJob());
    };
  }, [dispatch, jobId]);

  // Format date
  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get tag color based on tag content
  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'full-time') return 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100';
    if (tagLower === 'part-time') return 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100';
    if (tagLower === 'remote') return 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100';
    if (tagLower === 'on-site' || tagLower === 'onsite') return 'bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-100';
    if (tagLower === 'hybrid') return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100';
    // Default color for other tags
    return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100';
  };

  return (
    <Layout>
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : currentJob ? (
        <div className="space-y-6">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                {currentJob.title}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {currentJob.company}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {currentJob.location}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {currentJob.type}
                </div>
                {currentJob.salary && (
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    {currentJob.salary}
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Posted on {formatDate(currentJob.createdAt)}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              {isAuthenticated && isCandidate && (
                <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Apply for {currentJob.title}</DialogTitle>
                    </DialogHeader>
                    <ApplicationForm 
                      jobId={currentJob.id} 
                      onSuccess={() => setApplicationDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              {!isAuthenticated && (
                <Button asChild>
                  <a href="/login">Sign in to Apply</a>
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {currentJob.tags && currentJob.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 my-4">
              <Badge variant="outline" className={getTagColor(currentJob.type)}>
                {currentJob.type}
              </Badge>
              
              {currentJob.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className={getTagColor(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Company info */}
          {currentJob.companyLogo && (
            <div className="flex items-center my-6">
              <img 
                src={currentJob.companyLogo} 
                alt={`${currentJob.company} logo`} 
                className="h-16 w-16 rounded-md object-cover mr-4"
              />
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{currentJob.company}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentJob.location}</p>
              </div>
            </div>
          )}

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-line">
                  {currentJob.description}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-line">
                  {currentJob.requirements}
                </div>
              </div>
            </CardContent>
            {isAuthenticated && isCandidate && (
              <CardFooter className="flex justify-end">
                <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Apply for this position</Button>
                  </DialogTrigger>
                </Dialog>
              </CardFooter>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Job not found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              The job listing you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/">Browse All Jobs</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
