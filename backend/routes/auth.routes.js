import express from 'express'
import {
  isAuthenticated,
  loginUser,
  logout,
  registerUser,
  sendResetPasswordOtp,
  sendVerifyOtp,
  verifyEmail,
  verifyResetPasswordEmail,
} from '../controllers/auth.controller.js'
import userAuth from '../middleware/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', registerUser)

authRouter.post('/login', loginUser)

authRouter.post('/logout', logout)

authRouter.get('/send-verify-otp', userAuth, sendVerifyOtp)

authRouter.post('/verify-otp', userAuth, verifyEmail)

authRouter.post('/is-auth', userAuth, isAuthenticated)

authRouter.post('/send-reset-otp', sendResetPasswordOtp)

authRouter.post('/reset-password', verifyResetPasswordEmail)
export default authRouter
