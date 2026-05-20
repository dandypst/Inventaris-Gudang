import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login')
    }
  }, [user, loading])

  return null
}
