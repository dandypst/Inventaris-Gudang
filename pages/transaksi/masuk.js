import Layout from '../../components/Layout'
import TransaksiForm from '../../components/TransaksiForm'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthContext'
import { format } from 'date-fns'

export default function BarangMasuk() {
  const { user } = useAuth()
  const [recent, setRecent] = useState([])

  const fetchRecent = async () => {
    if (!user) return
    const token = await user.getIdToken()
    const res = await fetch('/api/transaksi?tipe=masuk&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setRecent(data.data || [])
  }

  useEffect(() => { fetchRecent() }, [user])

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Barang Masuk</h1>
        <p className="page-subtitle">Input penerimaan barang ke gudang</p>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 auto' }}>
          <TransaksiForm tipe="masuk" onSuccess={fetchRecent} />
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="card">
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 16 }}>Masuk Terbaru</div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Waktu</th><th>Barang</th><th>Jumlah</th></tr></thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan={3} className="empty-state" style={{ padding: 24 }}>Belum ada data</td></tr>
                  ) : recent.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{format(new Date(t.createdAt), 'dd/MM HH:mm')}</td>
                      <td style={{ fontWeight: 500 }}>{t.namaBarang}<br/><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{t.kodeBarang}</span></td>
                      <td><span style={{ color: 'var(--success)', fontWeight: 500 }}>+{t.jumlah}</span> {t.satuan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
