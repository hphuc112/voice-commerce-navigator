// Authentication management for Voice Commerce Navigator
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  // Initialize authentication system
  init() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.updateUIForLoggedInUser();
    }

    // Set up event listeners
    this.setupEventListeners();
  }

  // Load users from localStorage (simulating backend)
  loadUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem("users", JSON.stringify(this.users));
  }

  // Set up event listeners for forms
  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));

      // Password strength checker
      const passwordInput = document.getElementById("password");
      if (passwordInput) {
        passwordInput.addEventListener("input", (e) =>
          this.checkPasswordStrength(e.target.value)
        );
      }
    }

    // Logout functionality (for other pages)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }
  }

  // Handle login form submission
  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    try {
      const user = this.authenticateUser(email, password);

      if (user) {
        this.currentUser = user;

        // Store user session
        if (rememberMe) {
          localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
          sessionStorage.setItem("currentUser", JSON.stringify(user));
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Show success message
        this.showMessage("Login successful! Redirecting...", "success");

        // Redirect to products page after short delay
        setTimeout(() => {
          window.location.href = "products.html";
        }, 1500);
      } else {
        this.showMessage(
          "Invalid email or password. Please try again.",
          "error"
        );
      }
    } catch (error) {
      this.showMessage("Login failed. Please try again.", "error");
      console.error("Login error:", error);
    }
  }

  // Handle register form submission
  async handleRegister(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const agreeTerms = document.getElementById("agreeTerms").checked;

    try {
      // Validation
      if (
        !this.validateRegistration(
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          agreeTerms
        )
      ) {
        return;
      }

      // Check if user already exists
      if (this.findUserByEmail(email)) {
        this.showMessage("An account with this email already exists.", "error");
        return;
      }

      // Create new user
      const newUser = {
        id: this.generateUserId(),
        firstName,
        lastName,
        email,
        password: this.hashPassword(password), // In production, use proper hashing
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
      };

      this.users.push(newUser);
      this.saveUsers();

      this.showMessage(
        "Account created successfully! Please log in.",
        "success"
      );

      // Redirect to login page after short delay
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      this.showMessage("Registration failed. Please try again.", "error");
      console.error("Registration error:", error);
    }
  }

  // Authenticate user credentials
  authenticateUser(email, password) {
    return this.users.find(
      (user) =>
        user.email === email &&
        user.password === this.hashPassword(password) &&
        user.isActive
    );
  }

  // Find user by email
  findUserByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  // Validate registration form
  validateRegistration(
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    agreeTerms
  ) {
    if (!firstName.trim()) {
      this.showMessage("First name is required.", "error");
      return false;
    }

    if (!lastName.trim()) {
      this.showMessage("Last name is required.", "error");
      return false;
    }

    if (!this.validateEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return false;
    }

    if (!this.validatePassword(password)) {
      this.showMessage(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
        "error"
      );
      return false;
    }

    if (password !== confirmPassword) {
      this.showMessage("Passwords do not match.", "error");
      return false;
    }

    if (!agreeTerms) {
      this.showMessage("You must agree to the terms and conditions.", "error");
      return false;
    }

    return true;
  }

  // Validate email format
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  // Check password strength and update UI
  checkPasswordStrength(password) {
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!strengthFill || !strengthText) return;

    let strength = 0;
    let strengthLabel = "";
    let strengthColor = "";

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    switch (strength) {
      case 0:
      case 1:
        strengthLabel = "Very Weak";
        strengthColor = "#ff4444";
        break;
      case 2:
        strengthLabel = "Weak";
        strengthColor = "#ff8800";
        break;
      case 3:
        strengthLabel = "Fair";
        strengthColor = "#ffaa00";
        break;
      case 4:
        strengthLabel = "Good";
        strengthColor = "#88cc00";
        break;
      case 5:
        strengthLabel = "Strong";
        strengthColor = "#00cc44";
        break;
    }

    strengthFill.style.width = `${(strength / 5) * 100}%`;
    strengthFill.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthLabel;
  }

  // Simple password hashing (use proper hashing in production)
  hashPassword(password) {
    // This is a simple hash for demo purposes
    // In production, use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Generate unique user ID
  generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    // Redirect to home page
    window.location.href = "index.html";
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Update UI for logged in user
  updateUIForLoggedInUser() {
    // Update navigation to show user info or logout option
    // This can be customized based on your UI needs
    const authLinks = document.querySelectorAll(".auth-links");
    authLinks.forEach((link) => {
      if (this.currentUser) {
        link.innerHTML = `
          <span>Welcome, ${this.currentUser.firstName}!</span>
          <button id="logoutBtn" class="logout-btn">Logout</button>
        `;
      }
    });
  }

  // Show message to user
  showMessage(message, type = "info") {
    // Remove existing messages
    const existingMessage = document.querySelector(".auth-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;

    // Insert message at the top of the form
    const authCard = document.querySelector(".auth-card");
    if (authCard) {
      authCard.insertBefore(messageDiv, authCard.firstChild);
    }

    // Auto-remove message after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Protect routes (redirect to login if not authenticated)
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager;
}
