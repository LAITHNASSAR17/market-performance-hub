
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Initialize site name from localStorage
const siteName = localStorage.getItem('siteName');
if (siteName) {
  document.title = siteName;
}

// Initialize favicon from localStorage
const favicon = localStorage.getItem('favicon');
if (favicon) {
  const linkElements = document.querySelectorAll("link[rel*='icon']");
  
  if (linkElements.length > 0) {
    // Update existing favicon links
    linkElements.forEach(link => {
      (link as HTMLLinkElement).href = favicon;
    });
  } else {
    // Create a new favicon link if none exists
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon;
    document.head.appendChild(link);
  }
}

// Set the default theme to light
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');

// Check for user auth status at startup
const authStatus = localStorage.getItem('trackmind_auth_status');
if (authStatus === 'true') {
  // Store that the user is authenticated so they stay logged in on refresh
  console.log('User is authenticated on app startup');
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);
