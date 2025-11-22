import { Link, useLocation } from 'react-router-dom'
import { Home, Search, PlusSquare, User, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const MobileBottomNav = () => {
  const location = useLocation()
  const { profile } = useAuthStore()

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Tìm kiếm', href: '/search', icon: Search },
    { name: 'Nóng', href: '/trending', icon: TrendingUp },
    { name: 'Đăng bài', href: '/new-post', icon: PlusSquare },
    { name: 'Hồ sơ', href: `/profile/${profile?.username || ''}`, icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe">
      <nav className="flex items-center justify-around py-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default MobileBottomNavav