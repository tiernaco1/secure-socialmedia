import { useState } from 'react'
import PostCarousel from './PostCarousel.jsx'
import CreatePost from './CreatePost.jsx'
import './LatestPosts.css'

function LatestPosts({ posts, onPostCreated }) {
  const [showModal, setShowModal] = useState(false)
  const isLoggedIn = !!localStorage.getItem('blogbar_userId')

  return (
    <section className="latest-posts">
      <div className="latest-posts-inner">
        <div className="latest-posts-header">
          <h2 className="latest-posts-heading">Latest Posts</h2>
          <div className="latest-posts-actions">
            {isLoggedIn && (
              <button className="latest-posts-newbtn" onClick={() => setShowModal(true)}>
                + New Post
              </button>
            )}
            <a href="#" className="latest-posts-viewall">View All &rarr;</a>
          </div>
        </div>

        {posts.length > 0
          ? <PostCarousel posts={posts} />
          : <p className="latest-posts-empty">No posts yet. Be the first to publish!</p>
        }
      </div>

      {showModal && (
        <CreatePost
          onClose={() => setShowModal(false)}
          onPostCreated={onPostCreated}
        />
      )}
    </section>
  )
}

export default LatestPosts
