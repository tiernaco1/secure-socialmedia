import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('blogbar_userId')

  function handleLogout() {
    localStorage.removeItem('blogbar_userId')
    localStorage.removeItem('blogbar_username')
    localStorage.removeItem('blogbar_certificate')
    localStorage.removeItem('blogbar_caCertificate')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <span className="navbar-logo">BlogBar</span>
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/profile" className="navbar-link">Profile</Link>
        </div>
        <div className="navbar-right">
          {isLoggedIn ? (
            <button className="navbar-btn" onClick={handleLogout}>Log Out</button>
          ) : (
            <Link to="/login" className="navbar-btn">Log In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
