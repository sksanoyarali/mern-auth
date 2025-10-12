import mongoose from 'mongoose'

const connectDb = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Database connected successfully')
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`)
  } catch (error) {
    console.log('Error in Database connection')
  }
}

export default connectDb
