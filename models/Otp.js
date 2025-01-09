import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 300, // Document will be automatically deleted after 5 minutes
  },
});

const Otp = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default Otp;