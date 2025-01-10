import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sendOtpEmail, verifyOtp } from "@/utils/auth";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        try {
          await dbConnect();

          // If OTP is not provided, send a new one
          if (!credentials.otp) {
            const result = await sendOtpEmail(credentials.email);
            if (!result.success) {
              throw new Error(result.message || "Failed to send OTP");
            }
            return null; // Return null to show OTP input field
          }

          // Verify OTP
          const verificationResult = await verifyOtp(credentials.email, credentials.otp);
          if (!verificationResult.success) {
            throw new Error("Invalid or expired OTP");
          }

          // Find or create user
          let user = await User.findOne({ email: credentials.email });

          if (!user) {
            user = await User.create({
              email: credentials.email,
              role: "user",
              createdAt: new Date(),
            });
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          await dbConnect();
          
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            await User.create({
              email: user.email,
              role: "user",
              createdAt: new Date(),
            });
          }
        }
        return true;
      } catch (error) {
        console.error("Sign in callback error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          await dbConnect();
          const user = await User.findOne({ email: session.user.email });
          
          if (user) {
            // session.user.id = user._id.toString();
            session.user.role = user.role || "user";
          }
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };