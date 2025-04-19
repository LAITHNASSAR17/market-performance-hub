
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          الصفحة التي تبحث عنها غير موجودة
        </p>
        <Button asChild variant="default" size="lg">
          <Link to="/">العودة للصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
