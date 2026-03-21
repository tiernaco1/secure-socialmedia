import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function ProfilePage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Profile page — coming soon.
        </p>
      </main>
      <Footer />
    </>
  )
}

export default ProfilePage
