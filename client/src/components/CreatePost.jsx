import { useState } from 'react'
import { encryptMessage, getPrivateKey } from '../utils/crypto.js'
import './CreatePost.css'

function CreatePost({ onClose, onPostCreated }) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]     = useState('Lifestyle')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userId   = localStorage.getItem('blogbar_userId')
      const username = localStorage.getItem('blogbar_username')
      const caCert   = localStorage.getItem('blogbar_caCertificate')
      const privKey  = getPrivateKey(username)

      if (!userId || !privKey) {
        setError('You must be logged in to post.')
        setLoading(false)
        return
      }

      // Fetch current group members + CRL
      const groupRes  = await fetch('/api/group/members')
      const groupData = await groupRes.json()

      // Encrypt the post content as JSON
      const plaintext = JSON.stringify({ title, description, category })
      const encrypted = encryptMessage(
        plaintext,
        groupData.members,
        caCert,
        groupData.revokedSerials
      )

      // Send encrypted post to server
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId:      userId,
          ciphertext:    encrypted.ciphertext,
          iv:            encrypted.iv,
          tag:           encrypted.tag,
          encryptedKeys: encrypted.encryptedKeys
        })
      })

      if (!postRes.ok) {
        const data = await postRes.json()
        setError(data.message || 'Failed to create post')
        return
      }

      // Refresh the feed and close the modal
      onPostCreated()
      onClose()
    } catch (err) {
      console.error('Post creation error:', err)
      setError('Something went wrong. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-post-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={e => e.stopPropagation()}>
        <div className="create-post-header">
          <h2>Create a Post</h2>
          <button className="create-post-close" onClick={onClose}>&times;</button>
        </div>

        <form className="create-post-form" onSubmit={handleSubmit}>
          <label className="create-post-label">Title</label>
          <input
            className="create-post-input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter post title..."
            required
          />

          <label className="create-post-label">Description</label>
          <textarea
            className="create-post-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Write your post content..."
            rows={4}
            required
          />

          <label className="create-post-label">Category</label>
          <select
            className="create-post-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option>Lifestyle</option>
            <option>Travel</option>
            <option>Technology</option>
            <option>Food</option>
            <option>Wellness</option>
          </select>

          {error && <p className="create-post-error">{error}</p>}

          <button className="create-post-btn" type="submit" disabled={loading}>
            {loading ? 'Encrypting & posting...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
