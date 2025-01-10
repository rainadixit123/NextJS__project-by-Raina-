"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sendOtpEmail, verifyOtp } from "@/utils/auth";
import { ApiResponse } from '@/utils/auth';


export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function handleSendOtpEmail() {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await sendOtpEmail(email);
      if (response.success) {
        setIsOtpSent(true);
        setError("");
        startCountdown();
      } else {
        throw new Error(response.error || "Failed to send OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  
  async function handleVerifyOtp() {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const verificationResult: ApiResponse = await verifyOtp(email, otp);
      
      if (verificationResult.success) {
        const result = await signIn("credentials", {
          email,
          otp,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        setEmail("");
        setOtp("");
        setIsOtpSent(false);
        
        router.push('/dashboard');
        router.refresh();
      } else {
        throw new Error(verificationResult.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isOtpSent || loading}
              className="w-full"
            />
          </div>

          {isOtpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                    setError("");
                  }
                }}
                disabled={loading}
                className="w-full"
                maxLength={6}
              />
              {countdown > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Resend OTP in {countdown}s
                </p>
              )}
              {countdown === 0 && isOtpSent && (
                <button
                  onClick={() => {
                    setOtp("");
                    handleSendOtpEmail();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          <Button 
            onClick={!isOtpSent ? handleSendOtpEmail : handleVerifyOtp}
            className="w-full"
            disabled={loading}
          >
            {loading 
              ? (isOtpSent ? "Verifying..." : "Sending...") 
              : (isOtpSent ? "Verify OTP" : "Send OTP")}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
}