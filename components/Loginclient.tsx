
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { sendOtpEmail, verifyOtp} from "@/lib/otpService";
export default function Loginclient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const sendOtp = async () => {
  //   if (!email) {
  //     setError("Please enter your email");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     // Call your API to send OTP
  //     const response = await fetch('/api/auth/send-otp', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || 'Failed to send OTP');
  //     }

  //     setIsOtpSent(true);
  //     setError("");
  //   } catch (err) {
  //     setError("Error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const verifyOtp = async () => {
  //   if (!otp) {
  //     setError("Please enter the OTP");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const result = await signIn("credentials", {
  //       email,
  //       otp,
  //       redirect: false,
  //     });
  //     if (result?.error) {
  //       throw new Error(result.error);
  //     }

  //     // If successful, redirect to dashboard
  //     router.push('/dashboard');
  //   } catch (err) {
  //     setError("Error");
  //     setLoading(false);
  //   }
  // };

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
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                className="w-full"
                maxLength={6}
              />
            </div>
          )}

          {!isOtpSent ? (
            <Button 
              onClick={sendOtpEmail} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <Button 
              onClick={verifyOtp} 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          )}

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