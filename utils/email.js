const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (name, verificationLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #4F46E5; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Plenty Events</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hello ${name},</p>
          <p>Thank you for signing up with Plenty Events! Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <center>
            <a href="${verificationLink}" class="button">Verify Email</a>
          </center>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account with Plenty Events, please ignore this email.</p>
          <p>© ${new Date().getFullYear()} Plenty Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: (name) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Plenty Events</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Plenty Events!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Your email has been successfully verified. Welcome to the Plenty Events community!</p>
          <p>You can now access all features of our platform.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Plenty Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken, userType) => {
  try {
    const transporter = createTransporter();
    
    // Check if FRONTEND_URL is defined, otherwise use a fallback
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&type=${userType}`;

    console.log('Sending verification email with link:', verificationLink);

    const mailOptions = {
      from: `"Plenty Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Plenty Events",
      html: emailTemplates.verification(name, verificationLink),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Plenty Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Plenty Events!",
      html: emailTemplates.welcome(name),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error for welcome email as it's not critical
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};
