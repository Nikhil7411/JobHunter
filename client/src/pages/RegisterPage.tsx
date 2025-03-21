import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-8 flex items-center">
        <svg className="h-10 w-10 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">JobConnect</span>
      </div>
      
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-md">
        <CardContent className="pt-6 px-6 pb-8">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
