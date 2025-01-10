// app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import Otp from "@/models/Otp";
import dbConnect from "@/lib/dbconnect";

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email, otp } = body;
    
    console.log('Verifying OTP for:', { email, otp }); // Debug log
    
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const record = await Otp.findOne({ email, otp });
    console.log('Found OTP record:', record); // Debug log
    
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ email, otp });
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 }
      );
    }

    // Delete the used OTP
    // await Otp.deleteOne({ email, otp });
    
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}