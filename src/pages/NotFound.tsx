import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Code2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Code2 className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-7xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            Oops! The page you're looking for doesn't exist. Maybe it's still being solved on LeetCode? 😄
          </p>
        </div>

        <Button asChild className="gradient-primary gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
