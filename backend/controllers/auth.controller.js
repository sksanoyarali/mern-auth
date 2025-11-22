import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import transporter from '../config/nodemailer.js'
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from '../config/emailTemplate.js'
const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
const registerUser = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing Details',
    })
  }
  try {
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })
    res.cookie('token', token, cookieOption)

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Welcome to My-Auth',
      text: `Hello ${name}, your account has been created successfully!`,
    }

    await transporter.sendMail(mailOptions)
    return res.status(201).json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email',
      })
    }

    const isMatched = await bcrypt.compare(password, user.password)

    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Password',
      })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })
    res.cookie('token', token, cookieOption)
    return res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      ...cookieOption,
      maxAge: undefined,
    })
    return res.status(200).json({
      success: true,
      message: 'logout successfully',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// send verification otp to user
const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user
    const user = await User.findById(userId)
    if (user.isAccountVerified) {
      return res.status(409).json({
        success: false,
        message: 'Account Already verified',
      })
    }
    const otp = crypto.randomInt(100000, 1000000).toString()

    user.verifyOtp = otp
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000

    await user.save()
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      // text: `Your OTP is ${otp}. Verify your Account using this OTP `,
      html: EMAIL_VERIFY_TEMPLATE.replace('{{otp}}', otp).replace(
        '{{email}}',
        user.email
      ),
    }
    await transporter.sendMail(mailOptions)
    res
      .status(200)
      .json({ success: true, message: 'Verification otp sent on on email' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const verifyEmail = async (req, res) => {
  const { otp } = req.body
  const userId = req.user
  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Missing Details',
    })
  }
  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
      })
    }
    if (user.verifyOtp === '' || user.verifyOtp != otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }
    user.isAccountVerified = true
    user.verifyOtp = ''
    user.verifyOtpExpireAt = 0
    await user.save()
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// check if user is authenticated
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

//send password-reset otp
const sendResetPasswordOtp = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    })
  }
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
    await user.save()

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset Otp',
      // text: `Your OTP for reseting your password is ${otp}. Use this OTP to proceed with resetting yyour Password`,
      html: PASSWORD_RESET_TEMPLATE.replace('{{otp}}', otp).replace(
        '{{email}}',
        user.email
      ),
    }
    await transporter.sendMail(mailOptions)

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
const verifyResetPasswordEmail = async (req, res) => {
  const { email, otp, newPassword } = req.body
  const userId = req.user
  if (!email || !newPassword || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Missing Details',
    })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found',
      })
    }
    if (user.resetOtp === '' || user.resetOtp != otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      })
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetOtp = ''
    user.resetOtpExpireAt = 0
    await user.save()
    return res.status(200).json({
      success: true,
      message: 'Reset password successfully',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
export {
  registerUser,
  loginUser,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetPasswordOtp,
  verifyResetPasswordEmail,
}
