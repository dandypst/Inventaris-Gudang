import { adminDb, adminAuth } from '../../lib/firebaseAdmin'
import { appendToSheet } from '../../lib/googleSheets'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'POST') {
    const { namaBarang, kodeBarang, kategori, jumlah, satuan, tipe, keterangan } = req.body

    if (!namaBarang || !jumlah || !tipe) {
      return res.status(400).json({ error: 'Field wajib tidak lengkap' })
    }

    const timestamp = new Date()
    const id = `TRX-${Date.now()}`

    const transaksi = {
      id,
      namaBarang,
      kodeBarang: kodeBarang || '-',
      kategori: kategori || 'Umum',
      jumlah: Number(jumlah),
      satuan: satuan || 'pcs',
      tipe, // 'masuk' | 'keluar'
      keterangan: keterangan || '',
      operator: decoded.email,
      createdAt: timestamp,
    }

    await adminDb.collection('transaksi').doc(id).set(transaksi)

    // Update stok barang
    const stokRef = adminDb.collection('stok').doc(kodeBarang || namaBarang)
    const stokSnap = await stokRef.get()
    const currentStok = stokSnap.exists ? stokSnap.data().jumlah : 0
    const newStok = tipe === 'masuk' ? currentStok + Number(jumlah) : currentStok - Number(jumlah)

    await stokRef.set({
      namaBarang,
      kodeBarang: kodeBarang || namaBarang,
      kategori: kategori || 'Umum',
      satuan: satuan || 'pcs',
      jumlah: Math.max(0, newStok),
      updatedAt: timestamp,
    }, { merge: true })

    // Sync ke Google Sheets
    try {
      const tglFormatted = format(timestamp, 'dd/MM/yyyy HH:mm', { locale: id })
      await appendToSheet([
        id, tglFormatted, tipe.toUpperCase(), namaBarang, kodeBarang || '-',
        kategori || 'Umum', Number(jumlah), satuan || 'pcs', keterangan || '', decoded.email
      ])
    } catch (sheetErr) {
      console.error('Google Sheets sync error:', sheetErr)
      // Tidak gagalkan request utama jika sheets error
    }

    return res.status(200).json({ success: true, data: transaksi })
  }

  if (req.method === 'GET') {
    const { limit = 50, tipe, startDate, endDate, search } = req.query
    let query = adminDb.collection('transaksi').orderBy('createdAt', 'desc')

    if (tipe && tipe !== 'semua') query = query.where('tipe', '==', tipe)

    const snapshot = await query.limit(Number(limit)).get()
    let data = snapshot.docs.map(d => ({
      ...d.data(),
      createdAt: d.data().createdAt.toDate().toISOString(),
    }))

    if (search) {
      const s = search.toLowerCase()
      data = data.filter(d =>
        d.namaBarang?.toLowerCase().includes(s) ||
        d.kodeBarang?.toLowerCase().includes(s)
      )
    }

    if (startDate) data = data.filter(d => new Date(d.createdAt) >= new Date(startDate))
    if (endDate) data = data.filter(d => new Date(d.createdAt) <= new Date(endDate))

    return res.status(200).json({ data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
