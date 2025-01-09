import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import Otp from "@/models/Otp";
import dbConnect from "@/lib/dbconnect";
export const runtime = 'nodejs';

export async function POST(req: Request) {
    await dbConnect();
  const { email } = await req.json();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    await Otp.create({ email, otp, expiresAt: Date.now() + 300000 });
    return NextResponse.json({ success: true, otp });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}