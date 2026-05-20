import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../components/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ masuk: 0, keluar: 0, totalItem: 0, stokRendah: 0 })
  const [chartData, setChartData] = useState([])
  const [recentTrx, setRecentTrx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const token = await user.getIdToken()
    const headers = { Authorization: `Bearer ${token}` }

    const [trxRes, stokRes] = await Promise.all([
      fetch('/api/transaksi?limit=200', { headers }),
      fetch('/api/stok', { headers }),
    ])
    const trxData = await trxRes.json()
    const stokData = await stokRes.json()

    const transaksi = trxData.data || []
    const stok = stokData.data || []

    const today = new Date()
    const masukToday = transaksi.filter(t => t.tipe === 'masuk' && new Date(t.createdAt) > subDays(today, 30)).length
    const keluarToday = transaksi.filter(t => t.tipe === 'keluar' && new Date(t.createdAt) > subDays(today, 30)).length

    setStats({
      masuk: masukToday,
      keluar: keluarToday,
      totalItem: stok.length,
      stokRendah: stok.filter(s => s.jumlah < 10).length,
    })

    // Chart: last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i)
      const label = format(d, 'dd MMM', { locale: id })
      const dayStr = format(d, 'yyyy-MM-dd')
      const masuk = transaksi.filter(t => t.tipe === 'masuk' && t.createdAt?.startsWith(dayStr)).length
      const keluar = transaksi.filter(t => t.tipe === 'keluar' && t.createdAt?.startsWith(dayStr)).length
      return { label, masuk, keluar }
    })
    setChartData(days)
    setRecentTrx(transaksi.slice(0, 8))
    setLoading(false)
  }

  const StatCard = ({ label, value, color, icon }) => (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75"><path d={icon}/></svg>
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Selamat datang, {user?.email} — {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id })}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="loading-spinner" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>
      ) : (
        <>
          <div className="grid-4 mb-6">
            <StatCard label="Transaksi Masuk (30 hari)" value={stats.masuk} color="var(--success)" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            <StatCard label="Transaksi Keluar (30 hari)" value={stats.keluar} color="var(--danger)" icon="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            <StatCard label="Total Jenis Barang" value={stats.totalItem} color="var(--accent)" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            <StatCard label="Stok Hampir Habis" value={stats.stokRendah} color="var(--warning)" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </div>

          <div className="grid-2 mb-6" style={{ gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 14 }}>Aktivitas 7 Hari Terakhir</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="masuk" name="Masuk" fill="#10B981" radius={[4,4,0,0]} />
                  <Bar dataKey="keluar" name="Keluar" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div style={{ fontWeight: 500, marginBottom: 16, fontSize: 14 }}>Aksi Cepat</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: '+ Barang Masuk', href: '/transaksi/masuk', color: 'var(--success)', bg: 'var(--success-bg)' },
                  { label: '- Barang Keluar', href: '/transaksi/keluar', color: 'var(--danger)', bg: 'var(--danger-bg)' },
                  { label: 'Lihat Stok', href: '/stok', color: 'var(--accent)', bg: 'var(--accent-bg)' },
                  { label: 'History Transaksi', href: '/history', color: 'var(--text-secondary)', bg: 'var(--bg)' },
                ].map(item => (
                  <a key={item.href} href={item.href} style={{
                    display: 'block',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: item.bg,
                    color: item.color,
                    fontWeight: 500,
                    fontSize: 13,
                    border: `1px solid ${item.color}22`,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >{item.label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex-between mb-4">
              <div style={{ fontWeight: 500, fontSize: 14 }}>Transaksi Terbaru</div>
              <a href="/history" style={{ fontSize: 12, color: 'var(--accent)' }}>Lihat semua →</a>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Waktu</th><th>Tipe</th><th>Nama Barang</th><th>Kode</th><th>Jumlah</th><th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrx.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Belum ada transaksi</td></tr>
                  ) : recentTrx.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-secondary)' }}>{format(new Date(t.createdAt), 'dd/MM HH:mm')}</td>
                      <td><span className={`badge badge-${t.tipe}`}>{t.tipe === 'masuk' ? '↑ Masuk' : '↓ Keluar'}</span></td>
                      <td style={{ fontWeight: 500 }}>{t.namaBarang}</td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.kodeBarang}</td>
                      <td>{t.jumlah} {t.satuan}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}
