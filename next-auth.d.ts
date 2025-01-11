import NextAuth from "next-auth";

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email?: string;
      role?: string;
    }
  }

  interface User {
    role?: string;
  }

  interface JWT {
    role?: string;
  }
}