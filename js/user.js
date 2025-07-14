// User profile management for Voice Commerce Navigator
class UserManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  // Initialize user manager
  init() {
    // Get current user from auth manager
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
    }

    this.setupEventListeners();
  }

  // Set up event listeners for user profile operations
  setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", (e) =>
        this.handleProfileUpdate(e)
      );
    }

    // Change password form
    const changePasswordForm = document.getElementById("changePasswordForm");
    if (changePasswordForm) {
      changePasswordForm.addEventListener("submit", (e) =>
        this.handlePasswordChange(e)
      );
    }

    // Account deletion
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", () =>
        this.handleAccountDeletion()
      );
    }

    // Profile picture upload
    const profilePictureInput = document.getElementById("profilePicture");
    if (profilePictureInput) {
      profilePictureInput.addEventListener("change", (e) =>
        this.handleProfilePictureUpload(e)
      );
    }
  }

  // Get user profile data
  getUserProfile() {
    if (!this.currentUser) {
      return null;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find((user) => user.id === this.currentUser.id);
  }

  // Update user profile
  async handleProfileUpdate(event) {
    event.preventDefault();

    if (!this.currentUser) {
      this.showMessage("Please log in to update your profile.", "error");
      return;
    }

    const formData = new FormData(event.target);
    const updates = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: {
        street: formData.get("street"),
        city: formData.get("city"),
        state: formData.get("state"),
        zipCode: formData.get("zipCode"),
        country: formData.get("country"),
      },
      preferences: {
        newsletter: formData.get("newsletter") === "on",
        notifications: formData.get("notifications") === "on",
        voiceEnabled: formData.get("voiceEnabled") === "on",
      },
    };

    try {
      // Validate updates
      if (!this.validateProfileUpdate(updates)) {
        return;
      }

      // Update user in storage
      await this.updateUserInStorage(updates);

      // Update current user object
      Object.assign(this.currentUser, updates);

      // Update stored current user
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));

      this.showMessage("Profile updated successfully!", "success");
    } catch (error) {
      this.showMessage("Failed to update profile. Please try again.", "error");
      console.error("Profile update error:", error);
    }
  }

  // Handle password change
  async handlePasswordChange(event) {
    event.preventDefault();

    if (!this.currentUser) {
      this.showMessage("Please log in to change your password.", "error");
      return;
    }

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword =
      document.getElementById("confirmNewPassword").value;

    try {
      // Validate current password
      if (!this.verifyCurrentPassword(currentPassword)) {
        this.showMessage("Current password is incorrect.", "error");
        return;
      }

      // Validate new password
      if (!this.validatePassword(newPassword)) {
        this.showMessage(
          "New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
          "error"
        );
        return;
      }

      // Check password confirmation
      if (newPassword !== confirmNewPassword) {
        this.showMessage("New passwords do not match.", "error");
        return;
      }

      // Update password
      await this.updatePassword(newPassword);

      this.showMessage("Password changed successfully!", "success");

      // Clear form
      document.getElementById("changePasswordForm").reset();
    } catch (error) {
      this.showMessage("Failed to change password. Please try again.", "error");
      console.error("Password change error:", error);
    }
  }

  // Handle account deletion
  async handleAccountDeletion() {
    if (!this.currentUser) {
      this.showMessage("Please log in to delete your account.", "error");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    const password = prompt(
      "Please enter your password to confirm account deletion:"
    );

    if (!password) {
      return;
    }

    try {
      // Verify password
      if (!this.verifyCurrentPassword(password)) {
        this.showMessage(
          "Incorrect password. Account deletion cancelled.",
          "error"
        );
        return;
      }

      // Delete user from storage
      await this.deleteUserFromStorage();

      // Clear current session
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("currentUser");

      // Clear cart data
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartCount");

      this.showMessage(
        "Account deleted successfully. You will be redirected to the home page.",
        "success"
      );

      // Redirect to home page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      this.showMessage("Failed to delete account. Please try again.", "error");
      console.error("Account deletion error:", error);
    }
  }

  // Handle profile picture upload
  async handleProfilePictureUpload(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      this.showMessage("Please select a valid image file.", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showMessage("Image size should be less than 5MB.", "error");
      return;
    }

    try {
      // Convert to base64
      const base64Image = await this.fileToBase64(file);

      // Update user profile with image
      await this.updateUserInStorage({ profilePicture: base64Image });

      // Update current user
      this.currentUser.profilePicture = base64Image;
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));

      // Update UI
      this.updateProfilePictureUI(base64Image);

      this.showMessage("Profile picture updated successfully!", "success");
    } catch (error) {
      this.showMessage(
        "Failed to upload profile picture. Please try again.",
        "error"
      );
      console.error("Profile picture upload error:", error);
    }
  }

  // Validate profile update data
  validateProfileUpdate(updates) {
    if (!updates.firstName.trim()) {
      this.showMessage("First name is required.", "error");
      return false;
    }

    if (!updates.lastName.trim()) {
      this.showMessage("Last name is required.", "error");
      return false;
    }

    if (!this.validateEmail(updates.email)) {
      this.showMessage("Please enter a valid email address.", "error");
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

  // Verify current password
  verifyCurrentPassword(password) {
    if (!this.currentUser) return false;

    const hashedPassword = this.hashPassword(password);
    return this.currentUser.password === hashedPassword;
  }

  // Update user in storage
  async updateUserInStorage(updates) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex(
      (user) => user.id === this.currentUser.id
    );

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem("users", JSON.stringify(users));
    }
  }

  // Update password in storage
  async updatePassword(newPassword) {
    const hashedPassword = this.hashPassword(newPassword);
    await this.updateUserInStorage({ password: hashedPassword });
    this.currentUser.password = hashedPassword;
  }

  // Delete user from storage
  async deleteUserFromStorage() {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const filteredUsers = users.filter(
      (user) => user.id !== this.currentUser.id
    );
    localStorage.setItem("users", JSON.stringify(filteredUsers));
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // Update profile picture UI
  updateProfilePictureUI(base64Image) {
    const profilePicturePreview = document.getElementById(
      "profilePicturePreview"
    );
    if (profilePicturePreview) {
      profilePicturePreview.src = base64Image;
    }
  }

  // Simple password hashing (use proper hashing in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // Get user order history
  getOrderHistory() {
    if (!this.currentUser) return [];

    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    return orders.filter((order) => order.userId === this.currentUser.id);
  }

  // Get user preferences
  getUserPreferences() {
    if (!this.currentUser) return {};

    const user = this.getUserProfile();
    return user ? user.preferences || {} : {};
  }

  // Update user preferences
  async updateUserPreferences(preferences) {
    if (!this.currentUser) return false;

    try {
      await this.updateUserInStorage({ preferences });
      this.currentUser.preferences = preferences;
      localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
      return true;
    } catch (error) {
      console.error("Failed to update preferences:", error);
      return false;
    }
  }

  // Get user statistics
  getUserStats() {
    if (!this.currentUser) return null;

    const orders = this.getOrderHistory();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    return {
      totalOrders,
      totalSpent,
      memberSince: this.currentUser.createdAt,
      lastLogin: this.currentUser.lastLogin,
    };
  }

  // Show message to user
  showMessage(message, type = "info") {
    // Remove existing messages
    const existingMessage = document.querySelector(".user-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `user-message ${type}`;
    messageDiv.textContent = message;

    // Insert message at appropriate location
    const container =
      document.querySelector(".profile-container") ||
      document.querySelector(".main-content") ||
      document.body;
    if (container) {
      container.insertBefore(messageDiv, container.firstChild);
    }

    // Auto-remove message after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Initialize user profile page
  initProfilePage() {
    if (!this.currentUser) {
      window.location.href = "login.html";
      return;
    }

    const user = this.getUserProfile();
    if (!user) return;

    // Populate form fields
    this.populateProfileForm(user);

    // Display user stats
    this.displayUserStats();

    // Set up profile picture
    if (user.profilePicture) {
      this.updateProfilePictureUI(user.profilePicture);
    }
  }

  // Populate profile form with user data
  populateProfileForm(user) {
    const fields = ["firstName", "lastName", "email", "phone"];

    fields.forEach((field) => {
      const input = document.getElementById(field);
      if (input && user[field]) {
        input.value = user[field];
      }
    });

    // Address fields
    if (user.address) {
      const addressFields = ["street", "city", "state", "zipCode", "country"];
      addressFields.forEach((field) => {
        const input = document.getElementById(field);
        if (input && user.address[field]) {
          input.value = user.address[field];
        }
      });
    }

    // Preferences
    if (user.preferences) {
      const checkboxes = ["newsletter", "notifications", "voiceEnabled"];
      checkboxes.forEach((checkbox) => {
        const input = document.getElementById(checkbox);
        if (input && user.preferences[checkbox] !== undefined) {
          input.checked = user.preferences[checkbox];
        }
      });
    }
  }

  // Display user statistics
  displayUserStats() {
    const stats = this.getUserStats();
    if (!stats) return;

    const statsContainer = document.getElementById("userStats");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Total Orders:</span>
          <span class="stat-value">${stats.totalOrders}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Spent:</span>
          <span class="stat-value">${(stats.totalSpent / 100).toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Member Since:</span>
          <span class="stat-value">${new Date(
            stats.memberSince
          ).toLocaleDateString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Last Login:</span>
          <span class="stat-value">${
            stats.lastLogin
              ? new Date(stats.lastLogin).toLocaleDateString()
              : "Never"
          }</span>
        </div>
      `;
    }
  }

  // Export user data
  exportUserData() {
    if (!this.currentUser) return;

    const userData = {
      profile: this.getUserProfile(),
      orders: this.getOrderHistory(),
      preferences: this.getUserPreferences(),
      stats: this.getUserStats(),
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `user_data_${this.currentUser.id}.json`;
    link.click();

    this.showMessage("User data exported successfully!", "success");
  }
}

// Initialize user manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.userManager = new UserManager();
});

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = UserManager;
}
