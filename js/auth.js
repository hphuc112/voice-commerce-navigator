// Enhanced Authentication System for Voice Commerce Navigator
// Uses localStorage for simple user management (prototype/demo purposes)

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  init() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("vcn_currentUser");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.updateUIForLoggedInUser();
    }

    // Add event listeners for forms
    this.setupEventListeners();
  }

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

      // Password confirmation checker
      const confirmPasswordInput = document.getElementById("confirmPassword");
      if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", (e) =>
          this.validatePasswordMatch()
        );
      }
    }

    // Logout functionality (if logout button exists)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }
  }

  // Load users from localStorage
  loadUsers() {
    const users = localStorage.getItem("vcn_users");
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem("vcn_users", JSON.stringify(this.users));
  }

  // Handle user registration
  handleRegister(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const userData = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim().toLowerCase(),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      agreeTerms: formData.get("agreeTerms"),
    };

    // Validation
    if (!this.validateRegistration(userData)) {
      return;
    }

    // Check if user already exists
    if (this.users.find((user) => user.email === userData.email)) {
      this.showMessage("An account with this email already exists.", "error");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      createdAt: new Date().toISOString(),
      preferences: {
        voiceEnabled: false,
        theme: "light",
      },
    };

    this.users.push(newUser);
    this.saveUsers();

    this.showMessage(
      "Account created successfully! You can now sign in.",
      "success"
    );

    // Redirect to login page after short delay
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }

  // Handle user login
  handleLogin(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const rememberMe = formData.get("rememberMe");

    // Find user
    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      this.showMessage("Invalid email or password.", "error");
      return;
    }

    // Set current user
    this.currentUser = user;

    // Save login state
    if (rememberMe) {
      localStorage.setItem("vcn_currentUser", JSON.stringify(user));
    } else {
      sessionStorage.setItem("vcn_currentUser", JSON.stringify(user));
    }

    this.showMessage("Login successful! Redirecting...", "success");

    // Redirect to home page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }

  // Validate registration data
  validateRegistration(userData) {
    if (!userData.firstName || !userData.lastName) {
      this.showMessage("Please fill in all required fields.", "error");
      return false;
    }

    if (!this.isValidEmail(userData.email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return false;
    }

    if (userData.password.length < 6) {
      this.showMessage("Password must be at least 6 characters long.", "error");
      return false;
    }

    if (userData.password !== userData.confirmPassword) {
      this.showMessage("Passwords do not match.", "error");
      return false;
    }

    if (!userData.agreeTerms) {
      this.showMessage(
        "You must agree to the Terms of Service and Privacy Policy.",
        "error"
      );
      return false;
    }

    return true;
  }

  // Check password strength
  checkPasswordStrength(password) {
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");

    if (!strengthFill || !strengthText) return;

    let strength = 0;
    let text = "";
    let color = "";

    if (password.length === 0) {
      text = "Enter password";
      color = "#ddd";
    } else if (password.length < 6) {
      strength = 25;
      text = "Too short";
      color = "#ff4444";
    } else {
      strength = 25;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password) || /[!@#$%^&*]/.test(password)) strength += 25;

      if (strength <= 25) {
        text = "Weak";
        color = "#ff4444";
      } else if (strength <= 50) {
        text = "Fair";
        color = "#ffa500";
      } else if (strength <= 75) {
        text = "Good";
        color = "#00aa00";
      } else {
        text = "Strong";
        color = "#008800";
      }
    }

    strengthFill.style.width = `${strength}%`;
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
  }

  // Validate password match
  validatePasswordMatch() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const confirmInput = document.getElementById("confirmPassword");

    if (confirmPassword === "") {
      confirmInput.style.borderColor = "";
      return;
    }

    if (password === confirmPassword) {
      confirmInput.style.borderColor = "#00aa00";
    } else {
      confirmInput.style.borderColor = "#ff4444";
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    // Insert message
    const authCard = document.querySelector(".auth-card");
    if (authCard) {
      authCard.insertBefore(messageDiv, authCard.firstChild);
    }

    // Remove message after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Update UI for logged in user
  updateUIForLoggedInUser() {
    // This can be expanded based on your needs
    const userInfo = document.getElementById("userInfo");
    if (userInfo && this.currentUser) {
      userInfo.textContent = `Welcome, ${this.currentUser.firstName}!`;
    }
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem("vcn_currentUser");
    sessionStorage.removeItem("vcn_currentUser");
    window.location.href = "login.html";
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Protect page (redirect to login if not authenticated)
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  // Create demo user (for testing)
  createDemoUser() {
    const demoUser = {
      id: "demo",
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      password: "demo123",
      createdAt: new Date().toISOString(),
      preferences: {
        voiceEnabled: true,
        theme: "light",
      },
    };

    // Only add if doesn't exist
    if (!this.users.find((u) => u.email === demoUser.email)) {
      this.users.push(demoUser);
      this.saveUsers();
    }
  }
}

// Initialize authentication system
const auth = new AuthSystem();

// Create demo user for testing
auth.createDemoUser();

// Export for use in other files
window.auth = auth;

// Enhanced redirect logic for login success
// Add this to your existing auth.js file

// Update the handleLogin method in AuthSystem class
AuthSystem.prototype.handleLoginWithRedirect = function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get("email").trim().toLowerCase();
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe");

  // Find user
  const user = this.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    this.showMessage("Invalid email or password.", "error");
    return;
  }

  // Set current user
  this.currentUser = user;

  // Save login state
  if (rememberMe) {
    localStorage.setItem("vcn_currentUser", JSON.stringify(user));
  } else {
    sessionStorage.setItem("vcn_currentUser", JSON.stringify(user));
  }

  this.showMessage("Login successful! Redirecting...", "success");

  // Check for return URL
  const returnUrl = sessionStorage.getItem("vcn_returnUrl");
  const redirectUrl = returnUrl || "index.html";

  // Clear return URL
  sessionStorage.removeItem("vcn_returnUrl");

  // Redirect
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1000);
};

// Auto-redirect if already logged in (for login/register pages)
AuthSystem.prototype.checkExistingLogin = function () {
  const currentPage = window.location.pathname.split("/").pop();
  if (
    (currentPage === "login.html" || currentPage === "register.html") &&
    this.isLoggedIn()
  ) {
    // User is already logged in, redirect to home
    window.location.href = "index.html";
  }
};

// Update the constructor to include the redirect check
const originalInit = AuthSystem.prototype.init;
AuthSystem.prototype.init = function () {
  originalInit.call(this);
  this.checkExistingLogin();

  // Update login form handler if it exists
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.removeEventListener("submit", this.handleLogin);
    loginForm.addEventListener("submit", (e) =>
      this.handleLoginWithRedirect(e)
    );
  }
};

// Demo user credentials helper
AuthSystem.prototype.fillDemoCredentials = function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput && passwordInput) {
    emailInput.value = "demo@example.com";
    passwordInput.value = "demo123";

    // Show helpful message
    this.showMessage(
      'Demo credentials filled! Click "Sign In" to continue.',
      "info"
    );
  }
};

// Add demo button to login form
AuthSystem.prototype.addDemoButton = function () {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const demoButton = document.createElement("button");
  demoButton.type = "button";
  demoButton.className = "auth-btn secondary";
  demoButton.textContent = "Try Demo Account";
  demoButton.style.marginTop = "10px";
  demoButton.addEventListener("click", () => this.fillDemoCredentials());

  // Insert before the submit button
  const submitButton = loginForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.parentNode.insertBefore(demoButton, submitButton);
  }
};

// Call addDemoButton in init for login pages
const originalSetupEventListeners = AuthSystem.prototype.setupEventListeners;
AuthSystem.prototype.setupEventListeners = function () {
  originalSetupEventListeners.call(this);

  // Add demo button on login page
  if (document.getElementById("loginForm")) {
    this.addDemoButton();
  }
};
