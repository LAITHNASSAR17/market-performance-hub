
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { createDefaultAdmin } from './utils/createDefaultAdmin';

// محاولة إنشاء حساب مدير افتراضي عند بدء التطبيق
createDefaultAdmin().catch(err => {
  console.error('Error creating default admin:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
