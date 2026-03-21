import PostCarousel from './PostCarousel.jsx'
import './LatestPosts.css'

function LatestPosts({ posts }) {
  return (
    <section className="latest-posts">
      <div className="latest-posts-inner">
        <div className="latest-posts-header">
          <h2 className="latest-posts-heading">Latest Posts</h2>
          <a href="#" className="latest-posts-viewall">View All →</a>
        </div>
        <PostCarousel posts={posts} />
      </div>
    </section>
  )
}

export default LatestPosts
