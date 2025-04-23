
/**
 * Market Performance Hub - Login Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const loginAlert = document.getElementById('loginAlert');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide any previous alerts
      loginAlert.classList.add('d-none');
      
      // Get form values
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const rememberMe = document.getElementById('rememberMe').checked;
      
      // For demo purposes, we'll use a mock login
      // In a real application, this would be an API call to your server
      mockLogin(email, password, rememberMe);
    });
  }
  
  function mockLogin(email, password, rememberMe) {
    // Demo credentials check - in a real app this would be done server-side
    if (email === 'demo@example.com' && password === 'password123') {
      // Create a mock user and token
      const user = {
        id: '123456',
        email: email,
        firstName: 'Demo',
        lastName: 'User'
      };
      
      const token = 'mock-jwt-token-would-come-from-your-server';
      
      // Store in localStorage (or sessionStorage if remember me isn't checked)
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', token);
      storage.setItem('user', JSON.stringify(user));
      
      // Redirect to dashboard
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
      window.location.href = redirectUrl || 'dashboard.html';
    } else {
      // Show error message
      loginAlert.textContent = 'Invalid email or password.';
      loginAlert.classList.remove('d-none');
    }
  }
  
  // Check if user is already logged in
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    // Redirect to dashboard if already logged in
    window.location.href = 'dashboard.html';
  }
});
