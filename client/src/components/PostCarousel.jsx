import { useRef } from 'react'
import PostCard from './PostCard.jsx'
import './PostCarousel.css'

function PostCarousel({ posts }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    const container = scrollRef.current
    if (!container) return
    // Scroll by the width of one card + gap (20px)
    const card = container.querySelector('.post-card')
    const cardWidth = card ? card.offsetWidth + 20 : 320
    container.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
  }

  return (
    <div className="carousel-wrapper">
      <button className="carousel-arrow" onClick={() => scroll('left')} aria-label="Previous">
        &#8592;
      </button>

      <div className="carousel-track" ref={scrollRef}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            {...post}
            onRequestFriend={() => alert(`Friend request sent to ${post.author}!`)}
          />
        ))}
      </div>

      <button className="carousel-arrow" onClick={() => scroll('right')} aria-label="Next">
        &#8594;
      </button>
    </div>
  )
}

export default PostCarousel
