import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../components/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function History() {
  const { user } = useAuth()
  const [transaksi, setTransaksi] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipe, setTipe] = useState('semua')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => { fetchData() }, [user])

  async function fetchData() {
    if (!user) return
    setLoading(true)
    const token = await user.getIdToken()
    const params = new URLSearchParams({ limit: 200, tipe, search, startDate, endDate })
    const res = await fetch(`/api/transaksi?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setTransaksi(data.data || [])
    setLoading(false)
  }

  async function handleExport() {
    const token = await user.getIdToken()
    toast.loading('Mengunduh...')
    const res = await fetch(`/api/export?type=transaksi&startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `transaksi_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    toast.dismiss()
    toast.success('File berhasil diunduh')
  }

  return (
    <Layout>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">History Transaksi</h1>
          <p className="page-subtitle">{transaksi.length} transaksi ditemukan</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Excel
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input placeholder="Cari nama / kode barang..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <select value={tipe} onChange={e => setTipe(e.target.value)} style={{ width: 140 }}>
            <option value="semua">Semua Tipe</option>
            <option value="masuk">Masuk</option>
            <option value="keluar">Keluar</option>
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: 140 }} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: 140 }} />
          <button className="btn btn-primary btn-sm" onClick={fetchData}>Filter</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setTipe('semua'); setStartDate(''); setEndDate(''); setTimeout(fetchData, 0) }}>Reset</button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><div className="loading-spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Tanggal</th><th>Tipe</th><th>Nama Barang</th><th>Kode</th><th>Kategori</th><th>Jumlah</th><th>Keterangan</th><th>Operator</th></tr>
              </thead>
              <tbody>
                {transaksi.length === 0 ? (
                  <tr><td colSpan={9} className="empty-state" style={{ padding: 32 }}>Tidak ada data</td></tr>
                ) : transaksi.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{t.id}</td>
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{format(new Date(t.createdAt), 'dd/MM/yy HH:mm')}</td>
                    <td><span className={`badge badge-${t.tipe}`}>{t.tipe === 'masuk' ? '↑ Masuk' : '↓ Keluar'}</span></td>
                    <td style={{ fontWeight: 500 }}>{t.namaBarang}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{t.kodeBarang}</td>
                    <td><span style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 20, fontSize: 11 }}>{t.kategori}</span></td>
                    <td style={{ fontWeight: 500, color: t.tipe === 'masuk' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.tipe === 'masuk' ? '+' : '-'}{t.jumlah} {t.satuan}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.keterangan || '-'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.operator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
