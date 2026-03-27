import { useState, useEffect } from 'react'
import forge from 'node-forge'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { getPrivateKey, validateCertificate } from '../utils/crypto.js'
import './ProfilePage.css'

function ProfilePage() {
  const [allUsers, setAllUsers]   = useState([])
  const [memberIds, setMemberIds] = useState(new Set())
  const [adding, setAdding]         = useState(null)  // userId currently being added
  const [removing, setRemoving]     = useState(null)  // userId currently being removed
  const [revokedSerials, setRevokedSerials] = useState([])
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')

  const myUserId  = localStorage.getItem('blogbar_userId')
  const myUsername = localStorage.getItem('blogbar_username')
  const isMember  = memberIds.has(String(myUserId))

  async function loadData() {
    try {
      const [usersRes, groupRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/group/members')
      ])
      const users     = await usersRes.json()
      const groupData = await groupRes.json()

      setAllUsers(users)
      setMemberIds(new Set(groupData.members.map(m => String(m.userId))))
      setRevokedSerials(groupData.revokedSerials || [])
    } catch {
      setError('Failed to load user data')
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleRemove(user) {
    setError('')
    setSuccess('')
    setRemoving(user.userId)

    try {
      const res = await fetch('/api/group/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to remove user')
        return
      }

      setSuccess(`${user.username} has been removed from the group and can no longer decrypt any posts.`)
      await loadData()
    } catch (err) {
      console.error('Remove member error:', err)
      setError('Something went wrong.')
    } finally {
      setRemoving(null)
    }
  }

  async function handleAdd(newMember) {
    setError('')
    setSuccess('')
    setAdding(newMember.userId)

    try {
      const privateKeyPem = getPrivateKey(myUsername)
      if (!privateKeyPem) {
        setError('Private key not found in this browser. Did you register here?')
        return
      }

      // Validate the new member's certificate before doing any crypto
      const caCertPem = localStorage.getItem('blogbar_caCertificate')
      const certCheck = validateCertificate(newMember.certificate, caCertPem, revokedSerials)
      if (!certCheck.valid) {
        setError(`Cannot add ${newMember.username}: certificate is ${certCheck.reason.toLowerCase()}.`)
        return
      }

      // Fetch all existing posts so we can re-wrap their AES keys
      const postsRes = await fetch('/api/posts')
      const posts    = await postsRes.json()

      const privateKey    = forge.pki.privateKeyFromPem(privateKeyPem)
      const newMemberCert = forge.pki.certificateFromPem(newMember.certificate)
      const keyUpdates    = []

      for (const post of posts) {
        // Find my encrypted session key blob for this post
        const myBlob = post.encryptedKeys.find(k => String(k.userId) === String(myUserId))
        if (!myBlob) continue  // I don't have a key blob — skip this post

        // Step 1: RSA-OAEP decrypt my blob → raw AES key bytes
        const aesKey = privateKey.decrypt(
          forge.util.decode64(myBlob.encryptedSessionKey),
          'RSA-OAEP'
        )

        // Step 2: RSA-OAEP encrypt the AES key with the new member's public key
        const encryptedSessionKey = forge.util.encode64(
          newMemberCert.publicKey.encrypt(aesKey, 'RSA-OAEP')
        )

        keyUpdates.push({ postId: post.id, encryptedSessionKey })
      }

      // Send to server: add user to group + update all post key arrays
      const res = await fetch('/api/group/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newMember.userId, keyUpdates })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to add user')
        return
      }

      setSuccess(`${newMember.username} has been added to the group and can now decrypt all existing posts.`)
      await loadData()  // refresh member list
    } catch (err) {
      console.error('Add member error:', err)
      setError('Something went wrong during key re-wrapping.')
    } finally {
      setAdding(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="profile-main">
        <div className="profile-inner">
          <div className="profile-header">
            <h1 className="profile-heading">Group Management</h1>
            {myUsername && (
              <p className="profile-sub">
                Logged in as <strong>{myUsername}</strong> —{' '}
                {isMember
                  ? <span className="profile-badge profile-badge--member">Group member</span>
                  : <span className="profile-badge profile-badge--none">Not a member</span>
                }
              </p>
            )}
          </div>

          {error   && <p className="profile-error">{error}</p>}
          {success && <p className="profile-success">{success}</p>}

          {!isMember && myUserId && (
            <p className="profile-warning">
              You are not a group member, so you cannot re-wrap keys for new members.
              Ask an existing member to add you first.
            </p>
          )}

          <table className="profile-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Status</th>
                <th>Certificate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => {
                const isInGroup  = memberIds.has(String(user.userId))
                const isMe       = String(user.userId) === String(myUserId)
                const isAdding   = adding === user.userId
                const isRemoving = removing === user.userId

                const caCertPem  = localStorage.getItem('blogbar_caCertificate')
                const certResult = (user.certificate && caCertPem)
                  ? validateCertificate(user.certificate, caCertPem, revokedSerials)
                  : { valid: false, reason: 'No certificate' }
                let certClass = 'profile-badge--cert-valid'
                let certLabel = 'Valid'
                if (!certResult.valid) {
                  const r = (certResult.reason || '').toLowerCase()
                  if (r.includes('revoked'))      { certClass = 'profile-badge--cert-revoked'; certLabel = 'Revoked' }
                  else if (r.includes('expired')) { certClass = 'profile-badge--cert-expired'; certLabel = 'Expired' }
                  else                            { certClass = 'profile-badge--cert-revoked'; certLabel = 'Invalid' }
                }

                return (
                  <tr key={user.userId}>
                    <td>{user.username}{isMe ? ' (you)' : ''}</td>
                    <td>
                      {isInGroup
                        ? <span className="profile-badge profile-badge--member">Member</span>
                        : <span className="profile-badge profile-badge--none">Not a member</span>
                      }
                    </td>
                    <td>
                      <span className={`profile-badge ${certClass}`}>{certLabel}</span>
                    </td>
                    <td>
                      {isMe ? (
                        <span className="profile-action-none">—</span>
                      ) : isInGroup ? (
                        <button
                          className="profile-remove-btn"
                          onClick={() => handleRemove(user)}
                          disabled={!isMember || !!removing || !!adding}
                        >
                          {isRemoving ? 'Removing…' : 'Remove'}
                        </button>
                      ) : (
                        <button
                          className="profile-add-btn"
                          onClick={() => handleAdd(user)}
                          disabled={!isMember || !!adding || !!removing}
                        >
                          {isAdding ? 'Adding…' : 'Add to Group'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {allUsers.length === 0 && (
            <p className="profile-empty">No users found.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ProfilePage
