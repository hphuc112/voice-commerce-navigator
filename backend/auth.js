// Backend authentication logic for Voice Commerce Navigator
// This is a simple Node.js/Express implementation for development/testing

const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

class BackendAuth {
  constructor() {
    this.usersFilePath = path.join(__dirname, "users.json");
    this.sessionsFilePath = path.join(__dirname, "sessions.json");
    this.saltRounds = 10;
  }

  // Initialize backend authentication
  async init() {
    try {
      // Create users file if it doesn't exist
      await this.ensureUsersFile();

      // Create sessions file if it doesn't exist
      await this.ensureSessionsFile();

      console.log("Backend authentication initialized");
    } catch (error) {
      console.error("Failed to initialize backend auth:", error);
    }
  }

  // Ensure users file exists
  async ensureUsersFile() {
    try {
      await fs.access(this.usersFilePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.usersFilePath, JSON.stringify([], null, 2));
    }
  }

  // Ensure sessions file exists
  async ensureSessionsFile() {
    try {
      await fs.access(this.sessionsFilePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.sessionsFilePath, JSON.stringify([], null, 2));
    }
  }

  // Load users from file
  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      return [];
    }
  }

  // Save users to file
  async saveUsers(users) {
    try {
      await fs.writeFile(this.usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error("Failed to save users:", error);
      throw error;
    }
  }

  // Load sessions from file
  async loadSessions() {
    try {
      const data = await fs.readFile(this.sessionsFilePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      return [];
    }
  }

  // Save sessions to file
  async saveSessions(sessions) {
    try {
      await fs.writeFile(
        this.sessionsFilePath,
        JSON.stringify(sessions, null, 2)
      );
    } catch (error) {
      console.error("Failed to save sessions:", error);
      throw error;
    }
  }

  // Register new user
  async registerUser(userData) {
    try {
      const { firstName, lastName, email, password } = userData;

      // Validate input
      if (!firstName || !lastName || !email || !password) {
        throw new Error("All fields are required");
      }

      // Load existing users
      const users = await this.loadUsers();

      // Check if user already exists
      const existingUser = users.find((user) => user.email === email);
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create new user
      const newUser = {
        id: this.generateUserId(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        preferences: {
          newsletter: false,
          notifications: true,
          voiceEnabled: true,
        },
        profile: {
          phone: null,
          address: {
            street: null,
            city: null,
            state: null,
            zipCode: null,
            country: null,
          },
          profilePicture: null,
        },
      };

      // Add user to array
      users.push(newUser);

      // Save users
      await this.saveUsers(users);

      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Authenticate user login
  async loginUser(email, password) {
    try {
      // Load users
      const users = await this.loadUsers();

      // Find user by email
      const user = users.find((u) => u.email === email && u.isActive);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      await this.saveUsers(users);

      // Create session
      const session = await this.createSession(user.id);

      // Return user without password and session token
      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Create user session
  async createSession(userId) {
    try {
      const sessions = await this.loadSessions();

      // Clean up expired sessions
      const now = new Date();
      const activeSessions = sessions.filter(
        (session) => new Date(session.expiresAt) > now
      );

      // Create new session
      const session = {
        id: this.generateSessionId(),
        userId,
        token: this.generateToken(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        isActive: true,
      };

      activeSessions.push(session);
      await this.saveSessions(activeSessions);

      return session;
    } catch (error) {
      console.error("Session creation error:", error);
      throw error;
    }
  }

  // Validate session token
  async validateSession(token) {
    try {
      const sessions = await this.loadSessions();

      const session = sessions.find(
        (s) =>
          s.token === token && s.isActive && new Date(s.expiresAt) > new Date()
      );

      if (!session) {
        return null;
      }

      // Get user data
      const users = await this.loadUsers();
      const user = users.find((u) => u.id === session.userId);

      if (!user || !user.isActive) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Session validation error:", error);
      return null;
    }
  }

  // Logout user (invalidate session)
  async logoutUser(token) {
    try {
      const sessions = await this.loadSessions();

      const sessionIndex = sessions.findIndex((s) => s.token === token);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].isActive = false;
        await this.saveSessions(sessions);
      }

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const users = await this.loadUsers();

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.saveUsers(users);

      const { password: _, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }

  // Change user password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const users = await this.loadUsers();

      const user = users.find((u) => u.id === userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      user.password = hashedPassword;
      user.updatedAt = new Date().toISOString();

      await this.saveUsers(users);

      return true;
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    }
  }

  // Delete user account
  async deleteUser(userId) {
    try {
      const users = await this.loadUsers();

      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      // Remove user from array
      users.splice(userIndex, 1);
      await this.saveUsers(users);

      // Invalidate all user sessions
      const sessions = await this.loadSessions();
      const updatedSessions = sessions.map((session) =>
        session.userId === userId ? { ...session, isActive: false } : session
      );
      await this.saveSessions(updatedSessions);

      return true;
    } catch (error) {
      console.error("User deletion error:", error);
      throw error;
    }
  }

  // Generate unique user ID
  generateUserId() {
    return (
      "user_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  // Generate unique session ID
  generateSessionId() {
    return (
      "session_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  // Generate secure token
  generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const users = await this.loadUsers();
      const user = users.find((u) => u.id === userId);

      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  // Get all users (admin function)
  async getAllUsers() {
    try {
      const users = await this.loadUsers();
      return users.map((user) => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return [];
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const sessions = await this.loadSessions();
      const now = new Date();

      const activeSessions = sessions.filter(
        (session) => new Date(session.expiresAt) > now
      );

      await this.saveSessions(activeSessions);

      console.log(
        `Cleaned up ${sessions.length - activeSessions.length} expired sessions`
      );
    } catch (error) {
      console.error("Session cleanup error:", error);
    }
  }
}

// Export the class
module.exports = BackendAuth;

// Initialize if running directly
if (require.main === module) {
  const auth = new BackendAuth();
  auth.init();
}
