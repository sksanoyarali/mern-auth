import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDb from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
dotenv.config()

const app = express()

const port = process.env.PORT || 3000
connectDb()
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.get('/', (req, res) => {
  res.send('Root route')
  console.log('hello')
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.listen(port, () => {
  console.log(`App is listenning on port ${port}`)
})
