import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Test connection immediately
transporter.verify((err, success) => {
  if (err) console.error('SMTP Connection Failed:', err)
  else console.log('SMTP Ready ✅')
})

export default transporter
