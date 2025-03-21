import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "wouter";
import { AppDispatch } from "@/store";
import { fetchJobById } from "@/store/jobsSlice";
import Layout from "@/components/layout/Layout";
import JobForm from "@/components/jobs/JobForm";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JobPostPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isCompany } = useAuth();
  const [location, params] = useLocation();
  const [, navigate] = useLocation();
  const [jobData, setJobData] = useState<Job | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect if not a company
    if (!isCompany) {
      toast({
        title: "Access denied",
        description: "Only company accounts can post jobs",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    
    // Check if editing an existing job
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const editJobId = searchParams.get('edit');
    
    if (editJobId) {
      setIsEditing(true);
      setLoading(true);
      
      // Fetch job data for editing
      dispatch(fetchJobById(parseInt(editJobId, 10)))
        .then((action) => {
          if (fetchJobById.fulfilled.match(action)) {
            setJobData(action.payload);
          } else {
            toast({
              title: "Error",
              description: "Failed to load job data",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [dispatch, isCompany, location, navigate, toast]);

  return (
    <Layout requireAuth>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Job Listing' : 'Post New Job'}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isEditing 
            ? 'Update the details of your job listing below' 
            : 'Fill out the form below to create a new job listing'}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {isEditing ? 'Edit Job Details' : 'Job Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : (
            <JobForm initialData={jobData} isEditing={isEditing} />
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
