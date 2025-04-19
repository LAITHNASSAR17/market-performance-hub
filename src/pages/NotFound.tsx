
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

    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "with params:",
      Object.fromEntries(searchParams.entries())
    );
  }, [location.pathname, email, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
