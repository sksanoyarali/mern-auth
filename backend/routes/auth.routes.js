import express from 'express'
import {
  loginUser,
  logout,
  registerUser,
  sendVerifyOtp,
  verifyEmail,
} from '../controllers/auth.controller.js'
import userAuth from '../middleware/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', registerUser)

authRouter.post('/login', loginUser)

authRouter.post('/logout', logout)

authRouter.get('/send-verify-otp', userAuth, sendVerifyOtp)

authRouter.post('/verify-otp', userAuth, verifyEmail)
export default authRouter
