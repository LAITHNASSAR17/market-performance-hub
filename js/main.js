
/**
 * Market Performance Hub - Main JavaScript File
 * Contains shared functionality across the app
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });
  
  // Initialize popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });
  
  // Toast notification system
  window.showToast = function(title, message, type = 'info') {
    const toastEl = document.getElementById('toastNotification');
    
    if (toastEl) {
      const titleEl = document.getElementById('toastTitle');
      const messageEl = document.getElementById('toastMessage');
      
      // Clear any existing classes
      toastEl.className = 'toast';
      
      // Add appropriate styling based on type
      switch(type) {
        case 'success':
          toastEl.classList.add('text-white', 'bg-success');
          break;
        case 'error':
          toastEl.classList.add('text-white', 'bg-danger');
          break;
        case 'warning':
          toastEl.classList.add('text-dark', 'bg-warning');
          break;
        default:
          toastEl.classList.add('text-white', 'bg-primary');
      }
      
      // Update content
      titleEl.textContent = title;
      messageEl.textContent = message;
      
      // Show the toast
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  };
  
  // Handle logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Here you would normally clear authentication tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = 'login.html';
    });
  }
  
  // Check authentication status and update UI
  function checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    const userString = localStorage.getItem('user');
    
    // Update user display name if available
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userString) {
      try {
        const user = JSON.parse(userString);
        userNameElement.textContent = user.firstName || 'User';
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    
    // Redirect to login if required pages need authentication
    const requiresAuth = document.body.classList.contains('requires-auth');
    if (requiresAuth && !authToken) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }
  
  // Call the auth check
  checkAuthStatus();
});

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Helper function to format percentage
function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

// Simple AJAX helper function
function ajax(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          response: xhr.response
        });
      }
    };
    
    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.response
      });
    };
    
    if (data) {
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}
