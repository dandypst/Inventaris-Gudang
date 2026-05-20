import { adminDb, adminAuth } from '../../lib/firebaseAdmin'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(token)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const callerSnap = await adminDb.collection('users').doc(decoded.uid).get()
  if (!callerSnap.exists || callerSnap.data().role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang bisa mengakses endpoint ini' })
  }

  if (req.method === 'POST') {
    const { email, password, nama, role = 'operator' } = req.body
    if (!email || !password || !nama) return res.status(400).json({ error: 'Field tidak lengkap' })

    const newUser = await adminAuth.createUser({ email, password, displayName: nama })
    await adminDb.collection('users').doc(newUser.uid).set({
      uid: newUser.uid,
      email,
      nama,
      role,
      createdAt: new Date(),
      createdBy: decoded.email,
    })

    return res.status(200).json({ success: true, uid: newUser.uid })
  }

  if (req.method === 'GET') {
    const snapshot = await adminDb.collection('users').get()
    const users = snapshot.docs.map(d => ({
      ...d.data(),
      createdAt: d.data().createdAt?.toDate().toISOString(),
    }))
    return res.status(200).json({ data: users })
  }

  return res.status(405).end()
}
