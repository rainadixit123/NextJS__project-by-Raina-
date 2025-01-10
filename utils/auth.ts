// import { getBaseUrl } from './api-helpers';
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OtpResponse extends ApiResponse {
  expiresAt?: string;
}
function getApiUrl(path: string): string {
  // If we're in the browser, use relative paths
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // For server-side calls, use full URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
}
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
  
  export async function verifyOtp(email: string, otp: string): Promise<ApiResponse> {
    try {
      const res = await fetch(getApiUrl('/api/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
  
      // Handle non-JSON responses
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid server response');
      }
  
      const data: ApiResponse = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to verify OTP');
      }
  
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify OTP',
      };
    }
  }