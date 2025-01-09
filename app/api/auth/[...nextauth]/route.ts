import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sendOtpEmail, verifyOtp } from "@/lib/otpService";
import dbConnect from "@/lib/dbconnect";
import User from "@/models/User"

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

        await dbConnect();

        // If OTP is not provided, send a new one
        if (!credentials.otp) {
          const sentOtp = await sendOtpEmail(credentials.email);
          if (!sentOtp) {
            throw new Error("Failed to send OTP");
          }
          return null; // Return null to show OTP input field
        }

        // Verify OTP
        const isValid = await verifyOtp(credentials.email, credentials.otp);
        if (!isValid) {
          throw new Error("Invalid or expired OTP");
        }

        // Get or create user
        const db = await dbConnect();
        let user = await db.collection("users").findOne({ 
          email: credentials.email 
        });

        if (!user) {
          // Create new user if doesn't exist
          const result = await db.collection("users").insertOne({
            email: credentials.email,
            role: "user",
            createdAt: new Date(),
          });
          user = {
            id: result.insertedId.toString(),
            email: credentials.email,
            role: "user",
          };
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          // Check if Google user exists, if not create them
          const db = await dbConnect();
          const existingUser = await User.findOne({
            email: user.email,
          });

          if (!existingUser) {
            await User.create({
              email: user.email,
              role: "User",
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Sign in callback error:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        try {
          const db = await dbConnect();
          const user = await User.findOne({
            email: session.user.email,
          });
          session.user.role = user?.role || "User";
        } catch (error) {
          console.error("Session callback error:", error);
        }
      }
      return session;
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
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };