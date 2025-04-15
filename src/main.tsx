
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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

createRoot(document.getElementById("root")!).render(<App />);
