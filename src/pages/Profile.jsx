import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit2, ArrowLeft, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import PostCard from '@/components/Post/PostCard'
import Button from '@/components/UI/Button'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user, profile: currentProfile } = useAuthStore()
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  const currentUsername = username || currentProfile?.username

  useEffect(() => {
    if (currentUsername) {
      fetchProfile()
    }
  }, [currentUsername])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', currentUsername)
        .single()

      if (!error && data) {
        setProfile(data)
        setFormData(data)
        await fetchUserPosts(data.id)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Không tìm thấy người dùng')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async (userId) => {
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
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error) setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, ...formData })
      setEditing(false)
      toast.success('Cập nhật hồ sơ thành công')
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Quay lại</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between -mt-16 mb-4">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || '')}&background=0ea5e9&color=fff`}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
            />
            {isOwnProfile && (
              <Button
                onClick={() => setEditing(!editing)}
                variant="outline"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {editing ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            )}
          </div>

          {editing && isOwnProfile ? (
            <div className="space-y-4">
              <input
                type="text"
                value={formData.display_name || ''}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Tên hiển thị"
              />
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Tiểu sử"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>Hủy</Button>
                <Button onClick={handleSaveProfile}>Lưu</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.display_name}
                </h1>
                {profile.is_verified && (
                  <Shield className="w-6 h-6 text-primary-500" fill="currentColor" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
              <p className="text-gray-700 dark:text-gray-300 mt-3">{profile.bio}</p>
            </>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.posts_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bài viết</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.following_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang theo dõi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.followers_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Người theo dõi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.likes_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lượt thích</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Bài viết của {profile.display_name}
        </h2>
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có bài viết nào
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={() => fetchUserPosts(profile.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Profile