
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    // Special case for email verification links
    if (location.pathname === "/verify" && email) {
      console.log("Caught verification link in 404 page, redirecting to Email Verify page");
      navigate(`/email-verify?email=${encodeURIComponent(email)}`);
      return;
    }

    // Also handle direct /verify links without query params
    if (location.pathname === "/verify") {
      console.log("Caught verification link without email, redirecting to login page");
      navigate('/login');
      return;
    }

    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "with params:",
      Object.fromEntries(searchParams.entries())
    );
  }, [location.pathname, email, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">عذراً، الصفحة غير موجودة</p>
        <p className="text-gray-600 mb-8">إذا كنت تحاول التحقق من بريدك الإلكتروني، يرجى التأكد من استخدام الرابط الكامل المرسل إليك.</p>
        <a href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block">
          العودة إلى الصفحة الرئيسية
        </a>
      </div>
    </div>
  );
};

export default NotFound;
