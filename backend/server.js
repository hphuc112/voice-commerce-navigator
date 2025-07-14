// Simple Express server for Voice Commerce Navigator authentication
const express = require("express");
const cors = require("cors");
const path = require("path");
const BackendAuth = require("./auth");

const app = express();
const port = process.env.PORT || 3000;

// Initialize authentication
const auth = new BackendAuth();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "..")));

// Authentication middleware
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = await auth.validateSession(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

// Routes

// Register new user
app.post("/api/register", async (req, res) => {
  try {
    const user = await auth.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.loginUser(email, password);

    res.json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// Logout user
app.post("/api/logout", requireAuth, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    await auth.logoutUser(token);

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get current user profile
app.get("/api/profile", requireAuth, async (req, res) => {
  try {
    const user = await auth.getUserById(req.user.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update user profile
app.put("/api/profile", requireAuth, async (req, res) => {
  try {
    const user = await auth.updateUserProfile(req.user.id, req.body);
    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Change password
app.put("/api/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await auth.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete user account
app.delete("/api/account", requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deletion
    const users = await auth.loadUsers();
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const bcrypt = require("bcrypt");
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    await auth.deleteUser(req.user.id);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Validate session
app.get("/api/validate-session", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Get all users (admin endpoint)
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    // In production, add admin role check here
    const users = await auth.getAllUsers();
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "register.html"));
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server
async function startServer() {
  try {
    await auth.init();

    app.listen(port, () => {
      console.log(`Voice Commerce Navigator server running on port ${port}`);
      console.log(`Visit http://localhost:${port} to access the application`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Cleanup expired sessions every hour
setInterval(async () => {
  await auth.cleanupExpiredSessions();
}, 60 * 60 * 1000);

// Start the server
startServer();

module.exports = app;
