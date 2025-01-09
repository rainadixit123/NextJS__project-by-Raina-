// components/MainPageClient.tsx
'use client'

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MainPageClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to the App</h1>
        <p className="text-lg text-gray-600 mb-6">Please log in to continue.</p>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Button
            onClick={() =>
              signIn("google", {
                callbackUrl: "/dashboard",
              })
            }
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Login with Google
          </Button>
          <Link href="/login">
            <Button
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Login with Email OTP
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Link href="/dashboard">
        <Button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}