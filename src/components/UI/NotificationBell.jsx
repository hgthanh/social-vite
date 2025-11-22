import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { useNotificationsStore } from '@/store/notificationsStore'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead } = useNotificationsStore()
  const [isOpen, setIsOpen] = useState(false)
  
  const recentNotifications = notifications.slice(0, 5)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Thông báo
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Không có thông báo mới
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentNotifications.map((notification) => (
                <Link
                  key={notification.id}
                  to="/notifications"
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id)
                    }
                    setIsOpen(false)
                  }}
                  className={`block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.is_read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    {notification.sender?.[0]?.avatar_url && (
                      <img
                        src={notification.sender[0].avatar_url}
                        alt="sender"
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block p-3 text-center text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm border-t border-gray-200 dark:border-gray-700"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default NotificationBell