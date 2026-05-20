import { google } from 'googleapis'

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

export async function appendToSheet(values) {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Transaksi!A:J',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  })
}

export async function getSheetData() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Transaksi!A:J',
  })
  return res.data.values || []
}

export async function initSheetHeaders() {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

  const check = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Transaksi!A1',
  })

  if (!check.data.values) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Transaksi!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['ID', 'Tanggal', 'Tipe', 'Nama Barang', 'Kode Barang', 'Kategori', 'Jumlah', 'Satuan', 'Keterangan', 'Operator']],
      },
    })
  }
}
