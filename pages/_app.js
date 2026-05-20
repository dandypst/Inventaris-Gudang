import '../styles/globals.css'
import { AuthProvider } from '../components/AuthContext'
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: { fontSize: '13px', borderRadius: '8px' }
      }} />
      <Component {...pageProps} />
    </AuthProvider>
  )
}
