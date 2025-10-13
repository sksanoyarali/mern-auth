import User from '../models/user.model.js'

const getUserData = async (req, res) => {
  try {
    const userId = req.user
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not found',
      })
    }
    res.json({
      success: true,
      userdata: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
export { getUserData }
