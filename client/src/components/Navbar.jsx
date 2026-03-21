import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <span className="navbar-logo">BlogBar</span>
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/profile" className="navbar-link">Profile</Link>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="navbar-btn">Login / Out</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
