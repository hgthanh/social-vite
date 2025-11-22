import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import PostCard from '@/components/Post/PostCard'
import CreatePostQuick from '@/components/Post/CreatePostQuick'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

const NewsFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            display_name,
            avatar_url,
            is_verified
          ),
          post_likes:post_likes!inner (
            user_id,
            profiles:user_id (
              username,
              display_name
            )
          ),
          _count:post_likes (
            count
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      
      // Format posts with like count and user interaction
      const formattedPosts = data?.map(post => ({
        ...post,
        likes_count: post._count?.[0]?.count || 0,
        liked_by_users: post.post_likes || []
      })) || []

      setPosts(formattedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPosts()
  }

  useEffect(() => {
    fetchPosts()

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post:', payload)
          fetchPosts() // Refresh posts when new post is added
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quick create post */}
      <div className="mb-6">
        <CreatePostQuick onPostCreated={fetchPosts} />
      </div>

      {/* Refresh button */}
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bảng tin
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50"
        >
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Posts feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có bài viết</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Hãy là người đầu tiên chia sẻ bài viết!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onPostDeleted={() => fetchPosts()} />
          ))
        )}
      </div>
    </div>
  )
}

export default NewsFeed