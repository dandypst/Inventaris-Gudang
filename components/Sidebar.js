import { useRouter } from 'next/router'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/transaksi/masuk', label: 'Barang Masuk', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { href: '/transaksi/keluar', label: 'Barang Keluar', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  { href: '/stok', label: 'Stok Barang', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const adminItems = [
  { href: '/users', label: 'Kelola User', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function Sidebar() {
  const router = useRouter()
  const { user, userRole, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    toast.success('Berhasil logout')
    router.push('/login')
  }

  const NavIcon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )

  return (
    <aside className="sidebar">
      <div style={{ padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>SiGudang</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Manajemen Gudang</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 8px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', padding: '8px 8px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</div>
        {navItems.map(item => (
          <div
            key={item.href}
            className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
            onClick={() => router.push(item.href)}
          >
            <NavIcon d={item.icon} />
            {item.label}
          </div>
        ))}

        {userRole === 'admin' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', padding: '16px 8px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</div>
            {adminItems.map(item => (
              <div
                key={item.href}
                className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                <NavIcon d={item.icon} />
                {item.label}
              </div>
            ))}
          </>
        )}
      </div>

      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 50, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <span className={`badge badge-${userRole}`} style={{ fontSize: 10, padding: '1px 6px' }}>{userRole}</span>
          </div>
        </div>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
