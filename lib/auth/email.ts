/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if email is a .edu domain
 */
export function isEduEmail(email: string): boolean {
  if (!isValidEmail(email)) {
    return false
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  return domain?.endsWith('.edu') ?? false
}

/**
 * Validate student email (must be .edu domain)
 */
export function validateStudentEmail(email: string): { valid: boolean; isEdu: boolean; error?: string } {
  if (!email) {
    return { valid: false, isEdu: false, error: 'Email is required' }
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, isEdu: false, error: 'Invalid email format' }
  }
  
  const isEdu = isEduEmail(email)
  if (!isEdu) {
    return { valid: false, isEdu: false, error: 'Only .edu email addresses are allowed' }
  }
  
  return { valid: true, isEdu: true }
}

/**
 * Send OTP email (implementation depends on email service)
 */
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${email}: ${otp}`)
    return
  }
  
  // In production, use email service (nodemailer, SendGrid, AWS SES, etc.)
  // Example with nodemailer:
  /*
  const nodemailer = require('nodemailer')
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@vibe.app',
    to: email,
    subject: 'Your Vibe Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00FF6A;">Your Verification Code</h2>
        <p>Your verification code is:</p>
        <div style="background: #0A0A0A; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #00FF6A; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
  })
  */
  
  // For now, throw error in production if email service is not configured
  if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY && !process.env.AWS_SES_REGION) {
    throw new Error('Email service not configured. Please set up SMTP, SendGrid, or AWS SES.')
  }
}

