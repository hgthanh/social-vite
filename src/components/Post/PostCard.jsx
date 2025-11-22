import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Trash2, AlertCircle, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuthStore()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showMenu, setShowMenu] = useState(false)

  const profile = post.profiles?.[0] || {}

  const handleLike = async () => {
    if (!user) return

    try {
      if (liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        setLiked(false)
        setLikesCount(likesCount - 1)
      } else {
        await supabase
          .from('post_likes')
          .insert([
            {
              post_id: post.id,
              user_id: user.id,
            }
          ])
        setLiked(true)
        setLikesCount(likesCount + 1)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return

    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
      
      toast.success('Đã xóa bài viết')
      onPostDeleted()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa bài viết')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${profile.username}`} className="flex items-start gap-3 flex-1">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || '')}&background=0ea5e9&color=fff`}
            alt={profile.display_name}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                {profile.display_name}
              </h3>
              {profile.is_verified && (
                <Shield className="w-4 h-4 text-primary-500" fill="currentColor" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{profile.username}
            </p>
          </div>
        </Link>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-1.1 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 1.1-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 1.1-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              {user?.id === post.user_id && (
                <>
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa bài viết</span>
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  // Report functionality
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 last:rounded-b-lg"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Báo cáo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Time */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {formatDistanceToNow(new Date(post.created_at), { 
          addSuffix: true,
          locale: vi 
        })}
      </p>

      {/* Post Content */}
      <p className="text-gray-900 dark:text-white mb-4 leading-relaxed">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image_url && (
        <div className="mb-4 -mx-6 px-6">
          <img
            src={post.image_url}
            alt="Post"
            className="rounded-lg w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Post Video */}
      {post.video_url && (
        <div className="mb-4 -mx-6 px-6">
          <video
            controls
            className="rounded-lg w-full max-h-96 bg-black"
          >
            <source src={post.video_url} />
            Your browser does not support the video element.
          </video>
        </div>
      )}

      {/* Post Audio */}
      {post.audio_url && (
        <div className="mb-4">
          <audio controls className="w-full rounded-lg">
            <source src={post.audio_url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
        <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">0</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors">
          <Share2 className="w-5 h-5" />
          <span className="text-sm">0</span>
        </button>

        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
            liked
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
          <span className="text-sm">{likesCount}</span>
        </button>
      </div>
    </div>
  )
}

export default PostCard