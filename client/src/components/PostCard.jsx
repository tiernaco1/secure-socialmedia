import './PostCard.css'

// Icon components — inline SVG, no library needed
const PersonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z" />
  </svg>
)

function PostCard({ title, description, imageUrl, category, author, date, isFriend, onRequestFriend }) {
  return (
    <div className="post-card">
      {/* Image with category badge overlay */}
      <div className="post-card-image-wrapper">
        <img src={imageUrl} alt={isFriend ? title : 'Encrypted post'} className="post-card-image" />
        <span className="post-card-badge">{category}</span>
      </div>

      <div className="post-card-body">
        {/* Title row — shows "Ciphertext" + Request Friend button when not a friend */}
        <div className="post-card-title-row">
          <h3 className="post-card-title">
            {isFriend ? title : 'Ciphertext'}
          </h3>
          {!isFriend && (
            <button className="post-card-friend-btn" onClick={onRequestFriend}>
              Request Friend
            </button>
          )}
        </div>

        {/* Description — replaced with hint text for non-friends */}
        <p className="post-card-desc">
          {isFriend ? description : `Be friend with ${author} to view their blog`}
        </p>

        {/* Author + date meta row */}
        <div className="post-card-meta">
          <span className="post-card-author">
            <PersonIcon /> {author}
          </span>
          <span className="post-card-date">
            <CalendarIcon /> {date}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PostCard
