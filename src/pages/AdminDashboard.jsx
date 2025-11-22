import { useState, useEffect } from 'react'
import { BarChart3, Users, FileText, Shield, Trash2, AlertCircle, Send, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNotificationsStore } from '@/store/notificationsStore'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const { profile } = useAuthStore()
  const { createNotification } = useNotificationsStore()
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalHashtags: 0,
    verifiedAccounts: 0,
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [reports, setReports] = useState([])
  
  // Notification modal state
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationForm, setNotificationForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'system'
  })
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [sendToAll, setSendToAll] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (!profile?.is_admin) {
      window.location.href = '/'
    }
  }, [profile?.is_admin])

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      const { count: verifiedCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true)

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalHashtags: 0,
        verifiedAccounts: verifiedCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error) setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error) setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reported_by (
            username,
            display_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error) setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()

    if (!notificationForm.message.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo')
      return
    }

    if (!sendToAll && !notificationForm.userId) {
      toast.error('Vui lòng chọn người dùng hoặc check "Gửi đến tất cả"')
      return
    }

    setNotificationLoading(true)

    try {
      if (sendToAll) {
        // Send to all users
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id')

        if (allUsers && allUsers.length > 0) {
          const notifications = allUsers.map(user => ({
            recipient_id: user.id,
            sender_id: profile.id,
            type: 'admin',
            content: notificationForm.message,
            is_read: false,
            created_at: new Date().toISOString()
          }))

          const { error } = await supabase
            .from('notifications')
            .insert(notifications)

          if (error) throw error
          toast.success(`Đã gửi thông báo đến ${allUsers.length} người dùng`)
        }
      } else {
        // Send to specific user
        const { error } = await supabase
          .from('notifications')
          .insert([{
            recipient_id: notificationForm.userId,
            sender_id: profile.id,
            type: 'admin',
            content: notificationForm.message,
            is_read: false,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('Thông báo đã được gửi')
      }

      // Reset form
      setNotificationForm({
        userId: '',
        title: '',
        message: '',
        type: 'system'
      })
      setSendToAll(false)
      setShowNotificationModal(false)
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Có lỗi xảy ra khi gửi thông báo')
    } finally {
      setNotificationLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      toast.success('Bài viết đã được xóa')
      fetchPosts()
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleBanUser = async (userId) => {
    if (!confirm('Bạn chắc chắn muốn cấm tài khoản này?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId)

      if (error) throw error

      // Send notification to user
      await supabase
        .from('notifications')
        .insert([{
          recipient_id: userId,
          sender_id: profile.id,
          type: 'admin',
          content: 'Tài khoản của bạn đã bị cấm do vi phạm chính sách. Liên hệ support để được hỗ trợ.',
          is_read: false
        }])

      toast.success('Tài khoản đã bị cấm')
      fetchUsers()
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleVerifyAccount = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId)

      if (error) throw error

      // Send notification
      await supabase
        .from('notifications')
        .insert([{
          recipient_id: userId,
          sender_id: profile.id,
          type: 'admin',
          content: '🎉 Chúc mừng! Tài khoản của bạn đã được xác minh.',
          is_read: false
        }])

      toast.success('Tài khoản đã được xác minh')
      fetchUsers()
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${color} bg-opacity-10 p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trang quản trị
        </h1>
        <Button
          onClick={() => setShowNotificationModal(true)}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Gửi thông báo
        </Button>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Gửi Thông Báo
              </h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Send to All checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Gửi đến tất cả người dùng
                </span>
              </label>

              {/* User selection */}
              {!sendToAll && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chọn người dùng
                  </label>
                  <select
                    value={notificationForm.userId}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      userId: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">-- Chọn người dùng --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.display_name} (@{user.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nội dung thông báo
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    message: e.target.value
                  })}
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  placeholder="Nhập nội dung thông báo..."
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {notificationForm.message.length}/300
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNotificationModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  loading={notificationLoading}
                  disabled={!notificationForm.message.trim()}
                >
                  Gửi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('overview')
          }}
          className={`pb-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => {
            setActiveTab('users')
            fetchUsers()
          }}
          className={`pb-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Người dùng
        </button>
        <button
          onClick={() => {
            setActiveTab('content')
            fetchPosts()
          }}
          className={`pb-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Nội dung
        </button>
        <button
          onClick={() => {
            setActiveTab('reports')
            fetchReports()
          }}
          className={`pb-3 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'reports'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Báo cáo
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Tổng người dùng"
            value={stats.totalUsers}
            color="text-blue-600"
          />
          <StatCard
            icon={FileText}
            label="Tổng bài viết"
            value={stats.totalPosts}
            color="text-green-600"
          />
          <StatCard
            icon={Shield}
            label="Tài khoản xác minh"
            value={stats.verifiedAccounts}
            color="text-purple-600"
          />
          <StatCard
            icon={AlertCircle}
            label="Báo cáo chưa xử lý"
            value={reports.filter(r => r.status === 'pending').length}
            color="text-red-600"
          />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quản lý người dùng
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=0ea5e9&color=fff`}
                          alt={user.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.display_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!user.is_verified && (
                          <button
                            onClick={() => handleVerifyAccount(user.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                          >
                            Xác minh
                          </button>
                        )}
                        {user.is_verified && (
                          <span className="px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full">
                            ✓ Đã xác minh
                          </span>
                        )}
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          Cấm
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quản lý nội dung
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Ngày đăng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.profiles?.[0]?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.[0]?.display_name || '')}&background=0ea5e9&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {post.profiles?.[0]?.display_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            @{post.profiles?.[0]?.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {post.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Báo cáo vi phạm
          </h2>
          {reports.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              Hiện tại chưa có báo cáo nào.
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Báo cáo từ {report.reporter?.[0]?.display_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Loại: {report.report_type}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      report.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    }`}>
                      {report.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Lý do: {report.reason}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(report.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard