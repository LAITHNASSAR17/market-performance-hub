
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">الصفحة غير موجودة</p>
        <p className="text-muted-foreground mb-8">
          {location.pathname.includes('/playbook/') 
            ? 'تم تغيير تنسيق الروابط، الرجاء استخدام زر المشاركة للحصول على الرابط الصحيح' 
            : 'عذراً، لا يمكن العثور على الصفحة التي تبحث عنها'}
        </p>
        
        <Button asChild className="mr-4" variant="default">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
