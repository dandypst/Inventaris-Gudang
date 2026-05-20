import { adminDb, adminAuth } from '../../lib/firebaseAdmin'
import * as XLSX from 'xlsx'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    await adminAuth.verifyIdToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method !== 'GET') return res.status(405).end()

  const { type = 'transaksi', format = 'excel', startDate, endDate } = req.query

  let snapshot
  if (type === 'stok') {
    snapshot = await adminDb.collection('stok').orderBy('namaBarang').get()
  } else {
    snapshot = await adminDb.collection('transaksi').orderBy('createdAt', 'desc').limit(1000).get()
  }

  let rows = snapshot.docs.map(d => {
    const data = d.data()
    if (type === 'stok') {
      return {
        'Kode Barang': data.kodeBarang,
        'Nama Barang': data.namaBarang,
        'Kategori': data.kategori,
        'Stok': data.jumlah,
        'Satuan': data.satuan,
        'Terakhir Update': data.updatedAt?.toDate().toLocaleDateString('id-ID'),
      }
    }
    return {
      'ID': data.id,
      'Tanggal': data.createdAt?.toDate().toLocaleDateString('id-ID'),
      'Tipe': data.tipe?.toUpperCase(),
      'Nama Barang': data.namaBarang,
      'Kode': data.kodeBarang,
      'Kategori': data.kategori,
      'Jumlah': data.jumlah,
      'Satuan': data.satuan,
      'Keterangan': data.keterangan,
      'Operator': data.operator,
    }
  })

  if (startDate) rows = rows.filter(r => r['Tanggal'] && new Date(r['Tanggal']) >= new Date(startDate))
  if (endDate) rows = rows.filter(r => r['Tanggal'] && new Date(r['Tanggal']) <= new Date(endDate))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, type === 'stok' ? 'Stok Barang' : 'Transaksi')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  return res.send(buf)
}
