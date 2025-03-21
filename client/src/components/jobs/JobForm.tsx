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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Job, insertJobSchema } from "@shared/schema";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createJob, updateJob } from "@/store/jobsSlice";
import { useToast } from "@/hooks/use-toast";

// Extend the job schema to make tags a comma-separated string for the form
const jobFormSchema = insertJobSchema.extend({
  tagsString: z.string().optional(),
}).omit({ tags: true });

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  initialData?: Job; // For editing mode
  isEditing?: boolean;
}

export default function JobForm({ initialData, isEditing = false }: JobFormProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // Convert tags array to comma-separated string for the form
  const tagsToString = (tags?: string[]) => {
    return tags ? tags.join(', ') : '';
  };

  // Convert comma-separated string back to array
  const stringToTags = (tagsString?: string) => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
  };

  // Prepare initial form values
  const defaultValues: JobFormData = {
    title: initialData?.title || '',
    company: initialData?.company || user?.company || '',
    companyLogo: initialData?.companyLogo || '',
    location: initialData?.location || '',
    type: initialData?.type || 'Full-time',
    salary: initialData?.salary || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    tagsString: tagsToString(initialData?.tags),
  };

  // Form definition
  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues,
  });

  // Form submission handler
  const onSubmit = async (data: JobFormData) => {
    try {
      setIsSubmitting(true);
      
      // Convert tagsString back to tags array
      const jobData = {
        ...data,
        tags: stringToTags(data.tagsString),
      };
      
      // Remove tagsString which is not part of the API schema
      delete (jobData as any).tagsString;
      
      if (isEditing && initialData) {
        // Update existing job
        await dispatch(updateJob({ 
          id: initialData.id, 
          jobData 
        }));
        toast({
          title: "Job updated",
          description: "The job listing has been successfully updated.",
        });
      } else {
        // Create new job
        await dispatch(createJob(jobData));
        toast({
          title: "Job created",
          description: "Your job has been posted successfully.",
        });
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Frontend Developer" {...field} />
              </FormControl>
              <FormDescription>
                Be specific to attract the right candidates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyLogo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} />
                </FormControl>
                <FormDescription>
                  URL to your company logo (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. San Francisco, CA (Remote)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Full-time, Part-time, Contract" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Range</FormLabel>
              <FormControl>
                <Input placeholder="e.g. $80,000 - $100,000" {...field} />
              </FormControl>
              <FormDescription>
                Providing a salary range increases application rates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the role, responsibilities, and ideal candidate..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List the skills, qualifications, and experience required..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagsString"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="e.g. React, JavaScript, Remote, Junior" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated list of tags to help candidates find your job
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value as boolean}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active Job Listing</FormLabel>
                <FormDescription>
                  When active, this job will be visible to candidates
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : (
              isEditing ? 'Update Job' : 'Post Job'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
