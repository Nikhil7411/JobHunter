import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./store/authSlice";
import { RootState, AppDispatch } from "./store";
import { Toaster } from "@/components/ui/toaster";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import JobDetailPage from "@/pages/JobDetailPage";
import JobPostPage from "@/pages/JobPostPage";
import ProfilePage from "@/pages/ProfilePage";
import ApplicationsPage from "@/pages/ApplicationsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

// Private Route Component
const PrivateRoute = ({ component: Component, ...rest }: any) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <Component {...rest} />;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  return (
    <>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/jobs/:id" component={JobDetailPage} />
        
        {/* Private Routes */}
        <Route path="/dashboard">
          {() => <PrivateRoute component={DashboardPage} />}
        </Route>
        <Route path="/post-job">
          {() => <PrivateRoute component={JobPostPage} />}
        </Route>
        <Route path="/profile">
          {() => <PrivateRoute component={ProfilePage} />}
        </Route>
        <Route path="/applications">
          {() => <PrivateRoute component={ApplicationsPage} />}
        </Route>
        <Route path="/settings">
          {() => <PrivateRoute component={SettingsPage} />}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
