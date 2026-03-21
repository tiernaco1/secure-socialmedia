import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import LatestPosts from '../components/LatestPosts.jsx'
import Footer from '../components/Footer.jsx'
import { samplePosts } from '../data/samplePosts.js'

function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <LatestPosts posts={samplePosts} />
      <Footer />
    </>
  )
}

export default HomePage
