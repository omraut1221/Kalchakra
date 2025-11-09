import bcryptjs from "bcryptjs"; // Import bcryptjs for password hashing
import crypto from "crypto"; // Import crypto for generating secure tokens
import { User } from "../models/user.model.js"; // Import the User model
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"; // Utility to generate token and set cookie
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessfulEmail } from "../mailtrap/emails.js"; // Import all necessary email functions

// Signup controller for creating a new user
export const signup = async (req, res) => {
    const { email, password, name } = req.body; // Extract email, password, and name from request body

    try {
        // Validate if all required fields are provided
        if (!email || !name || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if a user with the given email already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        // Hash the user's password for security
        const hashPassword = await bcryptjs.hash(password, 10);

        // ✅ Decide role: admin if email matches ADMIN_EMAIL, otherwise customer
        const role =
            process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL
                ? "admin"
                : "customer";

        // ✅ Create a new user instance with role
        const user = new User({
            email,
            password: hashPassword,
            name,
            role, // 👈 added role field
        });

        // Mark user as verified immediately
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        // Save the user to the database
        await user.save();

        // Generate JWT token and set it in a cookie
        generateTokenAndSetCookie(res, user._id);

        // Log to console which role was assigned
        console.log(`✅ User created: ${user.email} | Role: ${user.role}`);

        // Respond with success and return the user object (without password)
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined, // Exclude the password from the response
            },
        });

    } catch (error) {
        console.error("Error in signup:", error); // Log the error for debugging
        res.status(500).json({ success: false, message: "Server error during signup" });
    }
};

// Email verification controller
export const verifyEmail = async (req, res) => {
    const { code } = req.body; // Extract the verification code from the request body

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();
        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ success: false, message: "Server error during email verification" });
    }
};

// Login controller
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token
        generateTokenAndSetCookie(res, user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // ✅ Return user details including role
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
                role: user.role, // ✅ Added role so frontend knows who logged in
            },
        });

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};


// Logout controller
export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout:", error);
        res.status(500).json({ success: false, message: "An error occurred during logout" });
    }
};

// Forgot password controller
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });

    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reset password controller
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendResetSuccessfulEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(500).json({ success: false, message: "Server error during password reset" });
    }
};

// Check if the user is authenticated
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};