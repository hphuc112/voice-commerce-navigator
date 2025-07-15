// Page Protection Utility
// Add this script to pages that require authentication

class PageProtection {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.init();
  }

  init() {
    // Check authentication status
    if (!this.isLoggedIn()) {
      this.redirectToLogin();
      return;
    }

    // Update UI for logged-in user
    this.updateUserInterface();
    this.setupLogoutHandlers();
  }

  // Get current user from storage
  getCurrentUser() {
    // Check localStorage first (remember me)
    let user = localStorage.getItem("vcn_currentUser");
    if (user) {
      return JSON.parse(user);
    }

    // Check sessionStorage
    user = sessionStorage.getItem("vcn_currentUser");
    if (user) {
      return JSON.parse(user);
    }

    return null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Redirect to login page
  redirectToLogin() {
    // Store current page to redirect back after login
    sessionStorage.setItem("vcn_returnUrl", window.location.href);
    window.location.href = "login.html";
  }

  // Update UI elements for logged-in user
  updateUserInterface() {
    if (!this.currentUser) return;

    // Update user name in header or elsewhere
    const userNameElements = document.querySelectorAll(".user-name");
    userNameElements.forEach((element) => {
      element.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    });

    // Update greeting elements
    const greetingElements = document.querySelectorAll(".user-greeting");
    greetingElements.forEach((element) => {
      element.textContent = `Welcome back, ${this.currentUser.firstName}!`;
    });

    // Show/hide user-specific elements
    const userOnlyElements = document.querySelectorAll(".user-only");
    userOnlyElements.forEach((element) => {
      element.style.display = "block";
    });

    const guestOnlyElements = document.querySelectorAll(".guest-only");
    guestOnlyElements.forEach((element) => {
      element.style.display = "none";
    });

    // Update navigation for logged-in user
    this.updateNavigation();
  }

  // Update navigation for logged-in users
  updateNavigation() {
    // Find navigation container
    const nav = document.querySelector(".header-right nav");
    if (!nav) return;

    // Check if logout link already exists
    if (nav.querySelector(".logout-link")) return;

    // Create user menu dropdown or simple logout link
    const userMenu = document.createElement("div");
    userMenu.className = "user-menu";
    userMenu.innerHTML = `
            <span class="user-name">${this.currentUser.firstName}</span>
            <button class="logout-btn">Logout</button>
        `;

    // Add to navigation
    nav.appendChild(userMenu);

    // Style the user menu
    this.styleUserMenu(userMenu);
  }

  // Style the user menu
  styleUserMenu(userMenu) {
    userMenu.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: 15px;
            padding: 5px 10px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        `;

    const userName = userMenu.querySelector(".user-name");
    if (userName) {
      userName.style.cssText = `
                color: white;
                font-weight: 500;
                font-size: 14px;
            `;
    }

    const logoutBtn = userMenu.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.style.cssText = `
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            `;

      logoutBtn.addEventListener("mouseenter", () => {
        logoutBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      });

      logoutBtn.addEventListener("mouseleave", () => {
        logoutBtn.style.backgroundColor = "transparent";
      });
    }
  }

  // Setup logout handlers
  setupLogoutHandlers() {
    // Handle logout buttons
    const logoutButtons = document.querySelectorAll(
      ".logout-btn, .logout-link"
    );
    logoutButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.logout();
      });
    });

    // Handle logout keyboard shortcut (Ctrl+L)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.logout();
      }
    });
  }

  // Logout user
  logout() {
    // Clear user data
    localStorage.removeItem("vcn_currentUser");
    sessionStorage.removeItem("vcn_currentUser");
    sessionStorage.removeItem("vcn_returnUrl");

    // Show logout message
    this.showLogoutMessage();

    // Redirect to login page
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }

  // Show logout message
  showLogoutMessage() {
    const message = document.createElement("div");
    message.className = "logout-message";
    message.textContent = "You have been logged out successfully.";
    message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #d4edda;
            color: #155724;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

    document.body.appendChild(message);

    // Remove message after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  // Get user preferences
  getUserPreferences() {
    return this.currentUser ? this.currentUser.preferences : null;
  }

  // Update user preferences
  updateUserPreferences(newPreferences) {
    if (!this.currentUser) return;

    this.currentUser.preferences = {
      ...this.currentUser.preferences,
      ...newPreferences,
    };

    // Update in storage
    const storageKey = localStorage.getItem("vcn_currentUser")
      ? "vcn_currentUser"
      : null;
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(this.currentUser));
    } else {
      sessionStorage.setItem(
        "vcn_currentUser",
        JSON.stringify(this.currentUser)
      );
    }

    // Update in users database
    this.updateUserInDatabase();
  }

  // Update user in localStorage database
  updateUserInDatabase() {
    const users = JSON.parse(localStorage.getItem("vcn_users") || "[]");
    const userIndex = users.findIndex((u) => u.id === this.currentUser.id);

    if (userIndex !== -1) {
      users[userIndex] = this.currentUser;
      localStorage.setItem("vcn_users", JSON.stringify(users));
    }
  }
}

// CSS for animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .user-menu {
        position: relative;
    }

    .user-only {
        display: none;
    }

    .guest-only {
        display: block;
    }
`;
document.head.appendChild(style);

// Initialize page protection
const pageProtection = new PageProtection();

// Export for use in other scripts
window.pageProtection = pageProtection;
