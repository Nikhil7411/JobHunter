import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { login, register, logout, fetchCurrentUser, updateProfile } from '@/store/authSlice';
import { LoginCredentials } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const resultAction = await dispatch(login(credentials));
      if (login.fulfilled.match(resultAction)) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        return true;
      } else {
        const errorMsg = resultAction.payload as string || 'Login failed';
        toast({
          title: "Login failed",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      const resultAction = await dispatch(register(userData));
      if (register.fulfilled.match(resultAction)) {
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
        return true;
      } else {
        const errorMsg = resultAction.payload as string || 'Registration failed';
        toast({
          title: "Registration failed",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const refreshUser = async () => {
    try {
      const resultAction = await dispatch(fetchCurrentUser());
      return fetchCurrentUser.fulfilled.match(resultAction);
    } catch (error) {
      return false;
    }
  };

  const handleUpdateProfile = async (profileData: any) => {
    try {
      const resultAction = await dispatch(updateProfile(profileData));
      if (updateProfile.fulfilled.match(resultAction)) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        return true;
      } else {
        const errorMsg = resultAction.payload as string || 'Profile update failed';
        toast({
          title: "Profile update failed",
          description: errorMsg,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Profile update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    ...auth,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    updateProfile: handleUpdateProfile,
    isCompany: auth.user?.type === 'company',
    isCandidate: auth.user?.type === 'candidate',
  };
}
