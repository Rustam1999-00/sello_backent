import { Request, Response } from "express";
import * as nodemailer from "nodemailer";
export const emailSending = async (email: string, res: Response) => {
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "tolliboyevrustam1999@gmail.com",
      pass: "nyiusmykxsdwezai",
    },
    secure: true,
  });
  const code: number = Math.floor(100000 + Math.random() * 900000);
  res.cookie("code", code, { maxAge: 120 * 100 * 60 });
  res.cookie("email", email, { maxAge: 120 * 100 * 60 });
  const mailData = {
    from: "tolliboyevrustam1999@gmail.com",
    to: `${email}`,
    subject: "Tasdiqlash kodi",
    text: "That was easy!",
    html: `<b>Hello </b>
             <br> 
Your verification code: ${code}<br/>`,
  };

  res.status(200).json({ message: "Verification code sent to your email" });
  await transporter.sendMail(mailData);
};
