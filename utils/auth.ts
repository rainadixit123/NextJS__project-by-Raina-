// import { getBaseUrl } from './api-helpers';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export async function sendOtpEmail(email: string) {
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to send OTP');
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }
  
  export async function verifyOtp(email: string, otp: string) {
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      
      // Log response for debugging
      console.log('OTP verification response:', data);
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to verify OTP');
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }