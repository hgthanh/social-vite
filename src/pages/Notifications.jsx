import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, UserPlus, Shield, Bell, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { viLocale } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import { useNotificationsStore } from '@/store/notificationsStore'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import Button from '@/components/UI/Button'

const Notifications = () => {
  const { user } = useAuthStore()
  const { notifications, unreadCount, initializeNotifications, markAllAsRead, deleteNotification, markAsRead } = useNotificationsStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = initializeNotifications(user.id)
      setLoading(false)
      return () => unsubscribe?.()
    }
  }, [user?.id, initializeNotifications])

  const getNotificationIcon = (type) => {
    const icons = {
      like: <Heart className="w-5 h-5 text-red-500" fill="currentColor" />,
      comment: <MessageCircle className="w-5 h-5 text-blue-500" />,
      follow: <UserPlus className="w-5 h-5 text-green-500" />,
      admin: <Shield className="w-5 h-5 text-purple-500" />,
      system: <Bell className="w-5 h-5 text-gray-500" />,
    }
    return icons[type] || icons.system
  }

  const getNotificationMessage = (notification) => {
    const sender = notification.sender?.[0]
    switch (notification.type) {
      case 'like':
        return `${sender?.display_name} đã thích bài viết của bạn`
      case 'comment':
        return `${sender?.display_name} đã bình luận trên bài viết của bạn`
      case 'follow':
        return `${sender?.display_name} đã theo dõi bạn`
      case 'admin':
        return notification.content
      default:
        return notification.content
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Thông báo
        </h1>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllAsRead(user.id)}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Bạn không có thông báo nào
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                notification.is_read
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
              } hover:border-gray-300 dark:hover:border-gray-600`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              {/* Notification Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {notification.sender?.[0] && notification.type !== 'admin' ? (
                      <Link
                        to={`/profile/${notification.sender[0].username}`}
                        className="flex items-center gap-2 mb-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={notification.sender[0].avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(notification.sender[0].display_name)}&background=0ea5e9&color=fff`}
                          alt={notification.sender[0].display_name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <span className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          {notification.sender[0].display_name}
                        </span>
                      </Link>
                    ) : (
                      <div className="mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Thông báo từ hệ thống
                        </span>
                      </div>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {getNotificationMessage(notification)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Time */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: viLocale
                  })}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications