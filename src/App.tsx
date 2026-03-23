import { Route, Switch, Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast-provider";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import LeadDetailPage from "@/pages/LeadDetailPage";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <div className="dark">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/dashboard">
          <ProtectedRoute component={DashboardPage} />
        </Route>
        <Route path="/dashboard/leads/:id">
          <ProtectedRoute component={LeadDetailPage} />
        </Route>
        <Route>
          <div className="flex h-screen items-center justify-center bg-background text-foreground">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="mt-2 text-muted-foreground">Page not found</p>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
