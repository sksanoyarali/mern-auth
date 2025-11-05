import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState(false)
  axios.defaults.withCredentials = true
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`)
      if (data.success) {
        setIsLoggedIn(true)
        getUserData()
      }
    } catch (error) {
      const msg =
        error?.response?.data.message ||
        error.message ||
        'something went wrong!try again'
      toast.error(msg)
    }
  }
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`)
      if (data.success) {
        setUserData(data.userdata)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      const msg =
        error?.response?.data.message ||
        error.message ||
        'something went wrong!try again'
      toast.error(msg)
    }
  }
  useEffect(() => {
    getAuthState()
  }, [])
  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
