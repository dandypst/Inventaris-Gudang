import { adminDb, adminAuth } from '../../lib/firebaseAdmin'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    await adminAuth.verifyIdToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    const { search, kategori } = req.query
    let query = adminDb.collection('stok').orderBy('namaBarang')

    if (kategori && kategori !== 'semua') query = query.where('kategori', '==', kategori)

    const snapshot = await query.get()
    let data = snapshot.docs.map(d => ({
      ...d.data(),
      updatedAt: d.data().updatedAt?.toDate().toISOString(),
    }))

    if (search) {
      const s = search.toLowerCase()
      data = data.filter(d =>
        d.namaBarang?.toLowerCase().includes(s) ||
        d.kodeBarang?.toLowerCase().includes(s)
      )
    }

    return res.status(200).json({ data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
