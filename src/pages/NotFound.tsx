
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mb-6">Page not found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          {isAuthenticated ? (
            <Button asChild variant="default">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="default">
              <Link to="/">Return to Home</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
