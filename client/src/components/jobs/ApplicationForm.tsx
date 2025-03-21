import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { insertApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { applyForJob } from "@/store/jobsSlice";
import { useToast } from "@/hooks/use-toast";

// Define type for the form data
type ApplicationFormData = z.infer<typeof insertApplicationSchema>;

interface ApplicationFormProps {
  jobId: number;
  onSuccess?: () => void;
}

export default function ApplicationForm({ jobId, onSuccess }: ApplicationFormProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Form definition
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(insertApplicationSchema),
    defaultValues: {
      resume: '',
      coverLetter: '',
    }
  });

  // Form submission handler
  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      
      await dispatch(applyForJob({
        id: jobId,
        applicationData: data
      }));
      
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully.",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/applications');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume / CV</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Paste your resume content here, or provide a link to your online resume/portfolio..."
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                You can paste the content of your resume or provide a link to your online resume or portfolio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write a brief cover letter explaining why you're a good fit for this position..."
                  className="min-h-[200px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional but recommended. Explain why you're interested in this position and what makes you a great candidate.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate(`/jobs/${jobId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
