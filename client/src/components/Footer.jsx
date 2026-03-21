import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-columns">
          <div className="footer-col footer-brand">
            <span className="footer-logo">BlogHub</span>
            <p className="footer-tagline">
              Your destination for inspiring stories and insightful articles.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Categories</h4>
            <ul className="footer-links">
              <li><a href="#">Lifestyle</a></li>
              <li><a href="#">Travel</a></li>
              <li><a href="#">Technology</a></li>
              <li><a href="#">Food</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">Follow Us</h4>
            <ul className="footer-links">
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">LinkedIn</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />
        <p className="footer-copyright">© 2026 BlogHub. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
