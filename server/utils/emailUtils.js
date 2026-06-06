import nodemailer from "nodemailer";
import "dotenv/config";

export const verifyEmail = async (token, email) => {
  // Check if environment variables are defined to prevent configuration errors
  if (!process.env.USER_MAIL || !process.env.USER_PASS) {
    throw new Error("Missing email credentials in environment variables");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
  });

  await transporter.verify();

  // Use an environment variable for your client URL.
  // This must be the front-end origin, not the backend API URL.
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(clientUrl)) {
    throw new Error(
      "Invalid CLIENT_URL environment variable. It must include the front-end origin, e.g. https://your-app.vercel.app",
    );
  }

  const verificationLink = `${clientUrl}/verify/${token}`;
  console.log("Verification link generated:", verificationLink);

  const mailConfigurations = {
    from: `"CoreFlow Team" <${process.env.USER_MAIL}>`,
    to: email,
    subject: "Email Verification",
    // Cleaned up the template string formatting
    text: `Hi There,

You have recently registered an account on CoreFlow. Please follow the link below to verify your email address.

${verificationLink}

Thanks,
The CoreFlow Team`,
  };

  try {
    const info = await transporter.sendMail(mailConfigurations);
    console.log("Email Sent Successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};


export const sendOTPMail = async (otp, email) => {
  // 1. Validate environment variables before creating transport
  if (!process.env.USER_MAIL || !process.env.USER_PASS) {
    throw new Error("Missing email credentials in environment variables");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.USER_PASS,
    },
  });

  await transporter.verify();

  const mailConfigurations = {
    // 2. Wrap sender name and email together
    from: `"CoreFlow Security" <${process.env.USER_MAIL}>`,
    to: email,
    subject: "Password Reset OTP",
    // 3. Professional HTML template layout
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e6e6e6; border-radius: 8px;">
        <h2 style="color: #00d2ff; text-align: center;">CoreFlow Security</h2>
        <p>Hello,</p>
        <p>You have requested a password reset for your CoreFlow workspace. Please use the One-Time Password (OTP) below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #161616; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px; border: 1px solid #262626;">
            ${otp}
          </span>
        </div>
        <p style="color: #525252; font-size: 12px;">This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #262626; margin: 20px 0;">
        <p style="color: #525252; font-size: 10px; text-align: center;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    // 4. Await the promise-based sendMail
    const info = await transporter.sendMail(mailConfigurations);
    console.log("OTP Sent Successfully: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP email: ", error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};