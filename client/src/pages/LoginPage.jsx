import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { generateKeyPair, storePrivateKey } from '../utils/crypto.js'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('register')  // 'register' | 'login'

  // Shared form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Generate RSA-2048 key pair in the browser (~1-2 seconds)
      const { publicKeyPem, privateKeyPem } = generateKeyPair()

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, publicKeyPem })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      // Private key stays in the browser only — never sent to the server
      storePrivateKey(username, privateKeyPem)

      // Save session info used by encryption/decryption throughout the app
      localStorage.setItem('blogbar_userId',        data.userId)
      localStorage.setItem('blogbar_username',      username)
      localStorage.setItem('blogbar_certificate',   data.certificate)
      localStorage.setItem('blogbar_caCertificate', data.caCertificate)

      navigate('/')
    } catch (err) {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('blogbar_userId',        data.userId)
      localStorage.setItem('blogbar_username',      data.username)
      localStorage.setItem('blogbar_certificate',   data.certificate)
      localStorage.setItem('blogbar_caCertificate', data.caCertificate)

      navigate('/')
    } catch (err) {
      setError('Network error — is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="auth-main">
        <div className="auth-card">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
              onClick={() => { setTab('register'); setError('') }}
            >
              Register
            </button>
            <button
              className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => { setTab('login'); setError('') }}
            >
              Login
            </button>
          </div>

          {tab === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <h2 className="auth-heading">Create an account</h2>
              <p className="auth-sub">A secure RSA key pair will be generated for you.</p>

              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />

              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Generating keys…' : 'Register'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2 className="auth-heading">Welcome back</h2>

              <label className="auth-label">Username</label>
              <input
                className="auth-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />

              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default LoginPage
