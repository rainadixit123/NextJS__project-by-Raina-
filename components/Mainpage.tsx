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
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Welcome to the App</h1>
        <p>Please log in to continue.</p>
        <div className="mt-4 space-x-4">
          <Button
            onClick={() => signIn("google", {
              callbackUrl: "/dashboard",
            })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login with Google
          </Button>
          <Link href="/login">
            <Button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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