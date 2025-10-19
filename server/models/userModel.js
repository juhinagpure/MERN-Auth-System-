import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: string, required: true },
  email: { type: string, required: true, unique: true },
  password: { type: string, required: true },
  verifyOtp: { type: string, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: string, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
