import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
  const { token } = req.cookies
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized login again',
    })
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    if (decodedToken.id) {
      req.user = decodedToken.id
    } else {
      return res.status(401).json({
        success: false,
        message: 'Not authorized login again',
      })
    }
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    })
  }
}
export default userAuth
