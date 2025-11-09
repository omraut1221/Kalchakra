import { User } from "../models/user.model.js";

// Middleware to allow only admin users
export const isAdmin = async (req, res, next) => {
  try {
    // Find the logged-in user using ID stored in token
    const user = await User.findById(req.userId);

    // If user not found
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // If user is not admin, block access
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    // If admin, continue to next function
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({ success: false, message: "Server error in admin check" });
  }
};
