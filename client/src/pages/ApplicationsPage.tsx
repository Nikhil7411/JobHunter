import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchApplications, updateApplicationStatus } from "@/store/jobsSlice";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { File, Clock, User, FileText, Eye } from "lucide-react";
import { Application } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function ApplicationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.jobs);
  const { isCompany, isCandidate } = useAuth();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  // Filter applications based on status
  const filteredApplications = applications.filter(app => {
    if (currentFilter === "all") return true;
    return app.status === currentFilter;
  });

  // Update application status
  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      await dispatch(updateApplicationStatus({ id: applicationId, status: newStatus }));
      toast({
        title: "Status updated",
        description: `Application status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  // View application details
  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  // Get color based on application status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Layout requireAuth>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isCompany ? 'Job Applications' : 'Your Applications'}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {isCompany 
            ? 'Review and manage applications for your job listings' 
            : 'Track the status of your job applications'}
        </p>
      </div>

      <Tabs defaultValue="all" onValueChange={setCurrentFilter}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
            {isCompany && (
              <>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value={currentFilter}>
          <Card>
            <CardHeader>
              <CardTitle>
                {currentFilter === 'all' 
                  ? 'All Applications' 
                  : `${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)} Applications`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {Array(5).fill(0).map((_, index) => (
                    <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div 
                      key={application.id}
                      className="p-4 border rounded-lg dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <File className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Application #{application.id}</span>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(application.status)}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>
                            Applied on {new Date(application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                        
                        {isCompany && (
                          <Select
                            value={application.status}
                            onValueChange={(value) => handleStatusChange(application.id, value)}
                          >
                            <SelectTrigger className="w-full sm:w-36">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="interviewed">Interviewed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    No applications found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isCompany
                      ? "You haven't received any applications for your job listings yet."
                      : "You haven't applied to any jobs yet."}
                  </p>
                  {isCandidate && (
                    <Button className="mt-4" asChild>
                      <a href="/">Browse Jobs</a>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Applied on {new Date(selectedApplication.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Resume
                </h3>
                <div className="whitespace-pre-line text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {selectedApplication.resume}
                </div>
              </div>

              {selectedApplication.coverLetter && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Cover Letter
                  </h3>
                  <div className="whitespace-pre-line text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {selectedApplication.coverLetter}
                  </div>
                </div>
              )}

              {isCompany && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Update Status</h3>
                  <Select
                    value={selectedApplication.status}
                    onValueChange={(value) => handleStatusChange(selectedApplication.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
