import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import LandingPage from './LandingPage'

/**
 * Entry point for "/".
 * Signed-in visitors go straight to their workspace; everyone else
 * sees the public landing page.
 */
const LandingRoute = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')

    if (token && userInfo) {
      navigate('/chat', { replace: true })
    }
  }, [navigate])

  return <LandingPage />
}

export default LandingRoute
