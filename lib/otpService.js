import nodemailer from "nodemailer";
import Otp from "../models/Otp";
import dbConnect from "./dbconnect";

export async function sendOtpEmail(email) {
 
    const res = await fetch('/api/email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return res.json();
  }

 

export async function verifyOtp(email, otp) {
  const res = await fetch('/api/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  return res.json();
}
