"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Button onClick={() => signOut()} className="mr-8 red-500 text-black">
          Logout
        </Button>
      </header>
      <main className="p-6 space-y-6">
        <Card className="p-4">
          <h2 className="text-xl font-bold">Welcome, {user.email}</h2>
          <p>Role: {user.role}</p>
        </Card>
        {user.role === "Admin" && (
          <Card className="p-4 bg-yellow-100">
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <p>Only visible to Admins.</p>
          </Card>
        )}
      </main>
    </div>
  );
}