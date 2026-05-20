import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../components/AuthContext'
import toast from 'react-hot-toast'

export default function Users() {
  const { user, userRole } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ email: '', password: '', nama: '', role: 'operator' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (userRole === 'admin') fetchUsers() }, [userRole])

  async function fetchUsers() {
    const token = await user.getIdToken()
    const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setUsers(data.data || [])
  }

  async function handleCreate(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('User berhasil dibuat!')
      setForm({ email: '', password: '', nama: '', role: 'operator' })
      fetchUsers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (userRole !== 'admin') return (
    <Layout>
      <div className="empty-state">
        <p style={{ fontSize: 15 }}>Akses ditolak. Hanya admin yang bisa membuka halaman ini.</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Kelola User</h1>
        <p className="page-subtitle">Tambah dan lihat daftar pengguna sistem</p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '0 0 360px' }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>Tambah User Baru</div>
          <form onSubmit={handleCreate}>
            {[
              { label: 'Nama Lengkap', key: 'nama', type: 'text', placeholder: 'Nama operator...' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'email@perusahaan.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 karakter' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="operator">Operator (input saja)</option>
                <option value="admin">Admin (akses penuh)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Buat User'}
            </button>
          </form>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 300 }}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>Daftar User ({users.length})</div>
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Dibuat</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid}>
                  <td style={{ fontWeight: 500 }}>{u.nama}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
