import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Search, 
  PlusSquare, 
  User, 
  Settings, 
  Shield,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  Bell
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import toast from 'react-hot-toast'

const Sidebar = ({ mobile }) => {
  const location = useLocation()
  const { user, profile, signOut } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Tìm kiếm', href: '/search', icon: Search },
    { name: 'Chủ đề nóng', href: '/trending', icon: TrendingUp },
    { name: 'Thông báo', href: '/notifications', icon: Bell },
    { name: 'Đăng bài', href: '/new-post', icon: PlusSquare },
    { name: 'Hồ sơ', href: `/profile/${profile?.username || ''}`, icon: User },
    { name: 'Cài đặt', href: '/settings', icon: Settings },
    { name: 'Xác nhận tài khoản', href: '/verify', icon: Shield },
  ]

  // Add admin link for admin users
  if (profile?.is_admin) {
    navigation.push({ name: 'Quản trị', href: '/admin', icon: BarChart3 })
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Đăng xuất thành công')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  return (
    <div className={`flex grow flex-col gap-y-5 overflow-y-auto ${
      mobile ? 'bg-white dark:bg-gray-900' : 'bg-white dark:bg-gray-900'
    } px-6 pb-4 border-r border-gray-200 dark:border-gray-700`}>
      <div className="flex h-16 shrink-0 items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Thazh Social
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          isActive 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          <li className="mt-auto">
            <div className="space-y-1">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="h-6 w-6 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                ) : (
                  <Sun className="h-6 w-6 shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                )}
                {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700">
                <img
                  className="h-8 w-8 rounded-full bg-gray-50"
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || user?.email || '')}&background=0ea5e9&color=fff`}
                  alt={profile?.display_name || user?.email}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate">{profile?.display_name || user?.email}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{profile?.username || user?.email?.split('@')[0]}
                    {profile?.is_verified && (
                      <Shield className="inline-block w-3 h-3 ml-1 text-primary-500" />
                    )}
                  </span>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Đăng xuất
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar