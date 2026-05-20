import { useState } from 'react'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const KATEGORI = ['Elektronik', 'Bahan Baku', 'Peralatan', 'Kemasan', 'Spare Part', 'ATK', 'Umum']
const SATUAN = ['pcs', 'unit', 'kg', 'gram', 'liter', 'ml', 'box', 'pak', 'roll', 'meter', 'set']

export default function TransaksiForm({ tipe, onSuccess }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    namaBarang: '', kodeBarang: '', kategori: 'Umum',
    jumlah: '', satuan: 'pcs', keterangan: ''
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.namaBarang || !form.jumlah) return toast.error('Nama barang dan jumlah wajib diisi')
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tipe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Berhasil mencatat barang ${tipe}!`)
      setForm({ namaBarang: '', kodeBarang: '', kategori: 'Umum', jumlah: '', satuan: 'pcs', keterangan: '' })
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan transaksi')
    } finally {
      setLoading(false)
    }
  }

  const color = tipe === 'masuk' ? 'var(--success)' : 'var(--danger)'
  const label = tipe === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            {tipe === 'masuk'
              ? <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              : <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            }
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Form {label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Data akan tersinkron ke Google Sheets</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nama Barang *</label>
            <input placeholder="Contoh: Baut M8" value={form.namaBarang} onChange={e => set('namaBarang', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Kode Barang</label>
            <input placeholder="Contoh: BT-M8-001" value={form.kodeBarang} onChange={e => set('kodeBarang', e.target.value)} />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)}>
              {KATEGORI.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="1" placeholder="0" value={form.jumlah} onChange={e => set('jumlah', e.target.value)} required style={{ flex: 1 }} />
              <select value={form.satuan} onChange={e => set('satuan', e.target.value)} style={{ width: 80 }}>
                {SATUAN.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Keterangan</label>
          <textarea placeholder="Opsional: asal/tujuan, nomor PO, dll." value={form.keterangan} onChange={e => set('keterangan', e.target.value)} rows={2} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button type="submit" className="btn" style={{ background: color, color: 'white', flex: 1, justifyContent: 'center' }} disabled={loading}>
            {loading ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : `Simpan ${label}`}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setForm({ namaBarang: '', kodeBarang: '', kategori: 'Umum', jumlah: '', satuan: 'pcs', keterangan: '' })}>
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
