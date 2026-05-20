import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../components/AuthContext'
import toast from 'react-hot-toast'

export default function Stok() {
  const { user } = useAuth()
  const [stok, setStok] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('semua')

  useEffect(() => { fetchStok() }, [user])

  async function fetchStok() {
    if (!user) return
    setLoading(true)
    const token = await user.getIdToken()
    const params = new URLSearchParams({ search, kategori })
    const res = await fetch(`/api/stok?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setStok(data.data || [])
    setLoading(false)
  }

  async function handleExport() {
    const token = await user.getIdToken()
    toast.loading('Mengunduh file...')
    const res = await fetch('/api/export?type=stok', { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `stok_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    toast.dismiss()
    toast.success('File berhasil diunduh')
  }

  const filtered = stok.filter(s => {
    const q = search.toLowerCase()
    return (!q || s.namaBarang?.toLowerCase().includes(q) || s.kodeBarang?.toLowerCase().includes(q)) &&
      (kategori === 'semua' || s.kategori === kategori)
  })

  const categories = ['semua', ...new Set(stok.map(s => s.kategori).filter(Boolean))]

  return (
    <Layout>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Stok Barang</h1>
          <p className="page-subtitle">{filtered.length} jenis barang terdaftar</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export Excel
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <input placeholder="Cari nama / kode barang..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select value={kategori} onChange={e => setKategori(e.target.value)} style={{ width: 160 }}>
            {categories.map(k => <option key={k} value={k}>{k === 'semua' ? 'Semua Kategori' : k}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={fetchStok}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="empty-state"><div className="loading-spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
          ) : (
            <table>
              <thead>
                <tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok</th><th>Satuan</th><th>Terakhir Update</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state" style={{ padding: 32 }}>Tidak ada data</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.kodeBarang}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{s.kodeBarang}</td>
                    <td style={{ fontWeight: 500 }}>{s.namaBarang}</td>
                    <td><span style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>{s.kategori}</span></td>
                    <td>
                      <span className={s.jumlah < 10 ? 'stok-low' : 'stok-ok'} style={{ fontWeight: 600, fontSize: 15 }}>
                        {s.jumlah}
                      </span>
                      {s.jumlah < 10 && <span style={{ fontSize: 11, color: 'var(--danger)', marginLeft: 4 }}>⚠ Hampir habis</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.satuan}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
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
