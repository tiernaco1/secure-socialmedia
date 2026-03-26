import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import LatestPosts from '../components/LatestPosts.jsx'
import Footer from '../components/Footer.jsx'
import { decryptMessage, getPrivateKey } from '../utils/crypto.js'

function HomePage() {
  const [posts, setPosts] = useState([])

  const fetchAndDecryptPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts')
      const rawPosts = await res.json()

      const userId     = localStorage.getItem('blogbar_userId')
      const username   = localStorage.getItem('blogbar_username')
      const privateKey = username ? getPrivateKey(username) : null

      const mapped = rawPosts.map(post => {
        let parsed = null

        // Only attempt decryption if the user is logged in and has a private key
        if (userId && privateKey) {
          try {
            const plaintext = decryptMessage(post, userId, privateKey)
            if (plaintext) parsed = JSON.parse(plaintext)
          } catch {
            // decryption failed — treat as non-member
          }
        }

        return {
          id:          post.id,
          title:       parsed?.title || '',
          description: parsed?.description || '',
          imageUrl:    `https://picsum.photos/seed/${post.id}/400/250`,
          category:    parsed?.category || 'General',
          author:      post.author,
          date:        new Date(post.createdAt).toLocaleDateString('en-US', {
                         month: 'short', day: 'numeric', year: 'numeric'
                       }),
          isFriend:    parsed !== null
        }
      })

      setPosts(mapped)
    } catch (err) {
      console.error('Failed to load posts:', err)
    }
  }, [])

  useEffect(() => {
    fetchAndDecryptPosts()
  }, [fetchAndDecryptPosts])

  return (
    <>
      <Navbar />
      <Hero />
      <LatestPosts posts={posts} onPostCreated={fetchAndDecryptPosts} />
      <Footer />
    </>
  )
}

export default HomePage
