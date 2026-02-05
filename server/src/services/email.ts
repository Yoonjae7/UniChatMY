import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create transporter - uses Ethereal for dev, real SMTP for production
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"UniChat" <noreply@unichat.app>',
      to: email,
      subject: '🎓 Your UniChat Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, rgba(0,255,245,0.1), rgba(157,0,255,0.1)); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center;">
              
              <!-- Logo -->
              <div style="margin-bottom: 24px;">
                <span style="font-size: 48px;">💬</span>
              </div>
              
              <!-- Title -->
              <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px 0;">
                Welcome to UniChat
              </h1>
              <p style="color: #9ca3af; margin: 0 0 32px 0;">
                Your verification code is below
              </p>
              
              <!-- Code -->
              <div style="background: rgba(0,255,245,0.1); border: 2px solid rgba(0,255,245,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00fff5;">
                  ${code}
                </span>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This code expires in 10 minutes
              </p>
              
            </div>
            
            <!-- Footer -->
            <p style="color: #4b5563; font-size: 12px; text-align: center; margin-top: 24px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Your UniChat verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    })

    console.log('Email sent:', info.messageId)
    
    // For Ethereal, log the preview URL
    if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
    
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
