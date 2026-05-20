import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="loading-spinner" />
    </div>
  )

  if (!user) return null

  return (
    <>
      <Sidebar />
      <main className="main-content">{children}</main>
    </>
  )
}
