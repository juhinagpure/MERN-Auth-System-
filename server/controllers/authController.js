import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
import userModel from "../models/userModel.js";

// 🟢 REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Secret 💌",
      text: `Hey ${name}! Welcome to Juhi's Secret. Your account has been successfully created with email: ${email}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Mail send failed:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Welcome email sent!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// 🟡 LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// 🔴 LOGOUT
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

// 📨 SEND VERIFICATION OTP
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from userAuth middleware

    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Hey ${user.name}, your OTP is ${otp}. It will expire in 24 hours.`,
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to email",
    });
  } catch (error) {
    console.error("SendVerifyOtp Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const userId = req.userId; // ✅ from middleware
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "Missing OTP" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("VerifyEmail Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🔐 IS AUTHENTICATED
export const isAuthenticated = async (req, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📨 SEND PASSWORD RESET OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Hey ${user.name}, your OTP is ${otp}. It will expire in 15 minutes.`,
    };

    try {
      await transporter.sendMail(mailOption);
    } catch (mailError) {
      console.error("Mail send failed:", mailError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 🔁 RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
