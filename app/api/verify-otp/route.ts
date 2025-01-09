// app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import Otp from "@/models/Otp";
import dbConnect from "@/lib/dbconnect";
export const runtime = 'nodejs';

export async function POST(req: Request) {
    await dbConnect();
 const { email, otp } = await req.json();

 try {
   const record = await Otp.findOne({ email, otp });
   
   if (!record || record.expiresAt < Date.now()) {
     return NextResponse.json({ success: false });
   }

   await Otp.deleteOne({ email, otp });
   return NextResponse.json({ success: true });

 } catch (error) {
   console.error(error);
   return NextResponse.json({ success: false }, { status: 500 });
 }
}