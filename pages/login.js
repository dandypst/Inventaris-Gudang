import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      toast.error('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>SiGudang</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Sistem Manajemen Gudang</p>
        </div>

        <div className="card">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Masuk'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Hubungi admin untuk mendapatkan akses
        </p>
      </div>
    </div>
  )
}
