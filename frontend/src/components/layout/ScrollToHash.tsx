import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const ScrollToHash = () => {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const element = document.getElementById(hash.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])

  return null
}

export default ScrollToHash
