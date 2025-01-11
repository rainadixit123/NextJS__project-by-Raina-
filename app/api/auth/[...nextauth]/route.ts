import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { sendOtpEmail, verifyOtp } from "@/utils/auth"
import dbConnect from "@/lib/dbconnect"
import User from "@/models/User"

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required")
        }

        try {
          await dbConnect()

          if (!credentials.otp) {
            const result = await sendOtpEmail(credentials.email)
            if (!result.success) {
              throw new Error(result.message || "Failed to send OTP")
            }
            return null
          }

          const verificationResult = await verifyOtp(
            credentials.email,
            credentials.otp
          )
          if (!verificationResult.success) {
            throw new Error("Invalid or expired OTP")
          }

          let user = await User.findOne({ email: credentials.email })

          if (!user) {
            user = await User.create({
              email: credentials.email,
              role: "user",
              createdAt: new Date(),
            })
          }

          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          await dbConnect()
          
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            await User.create({
              email: user.email,
              role: "user",
              createdAt: new Date(),
            })
          }
        }
        return true
      } catch (error) {
        console.error("Sign in callback error:", error)
        return false
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user = {
            ...session.user,
            id: token.sub,
            role: token.role as string || "user",
          }
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export const GET = handler
export const POST = handler