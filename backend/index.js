import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDb from './config/db.js'
dotenv.config()

const app = express()

const port = process.env.PORT || 3000
connectDb()
app.use(
  cors({
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
app.listen(port, () => {
  console.log(`App is listenning on port ${port}`)
})
