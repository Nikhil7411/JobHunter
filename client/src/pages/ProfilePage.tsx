import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define profile form schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().url("Please enter a valid URL").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateProfile, isCompany, isCandidate } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default form values from user data
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    company: user?.company || "",
    title: user?.title || "",
    location: user?.location || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  };

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Form submission handler
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout requireAuth>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Profile
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your personal information and how you present yourself on JobConnect
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Preview */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-400 dark:text-gray-500">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            {user?.title && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.title}
              </p>
            )}
            {user?.company && isCompany && (
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">
                {user.company}
              </p>
            )}
            {user?.location && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {user.location}
              </p>
            )}
            <div className="border-t w-full mt-4 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {user?.bio || "No bio added yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isCompany && (
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {isCompany ? "Job Title / Role" : "Professional Title"}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={isCompany ? "e.g. HR Manager" : "e.g. Senior Developer"} {...field} />
                      </FormControl>
                      <FormDescription>
                        Your title helps others understand your role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/profile.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL to your profile image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            isCompany
                              ? "Tell people about your company..."
                              : "Tell people about yourself..."
                          }
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
