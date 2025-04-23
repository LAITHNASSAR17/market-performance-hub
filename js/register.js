
/**
 * Market Performance Hub - Register Page JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  const registerAlert = document.getElementById('registerAlert');
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Hide any previous alerts
      registerAlert.classList.add('d-none');
      
      // Get form values
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const termsAgreed = document.getElementById('termsAgree').checked;
      
      // Basic validation
      if (password !== confirmPassword) {
        registerAlert.textContent = 'Passwords do not match.';
        registerAlert.classList.remove('d-none');
        return;
      }
      
      if (password.length < 8) {
        registerAlert.textContent = 'Password must be at least 8 characters long.';
        registerAlert.classList.remove('d-none');
        return;
      }
      
      if (!termsAgreed) {
        registerAlert.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
        registerAlert.classList.remove('d-none');
        return;
      }
      
      // For demo purposes, we'll use a mock registration
      // In a real application, this would be an API call to your server
      mockRegister(firstName, lastName, email, password);
    });
  }
  
  function mockRegister(firstName, lastName, email, password) {
    // Simulate successful registration
    // In a real app, this would involve server-side validation and database creation
    
    // Create a mock user and token
    const user = {
      id: 'new-user-' + Date.now(),
      email: email,
      firstName: firstName,
      lastName: lastName
    };
    
    const token = 'mock-jwt-token-for-new-user';
    
    // Store in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Show success message before redirecting
    registerAlert.textContent = 'Registration successful! Redirecting to dashboard...';
    registerAlert.classList.remove('d-none');
    registerAlert.classList.remove('alert-danger');
    registerAlert.classList.add('alert-success');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  }
  
  // Check if user is already logged in
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    // Redirect to dashboard if already logged in
    window.location.href = 'dashboard.html';
  }
});
