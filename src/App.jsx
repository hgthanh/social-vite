import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Stores
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

// Layout
import Layout from '@/components/Layout/Layout'
import AuthLayout from '@/components/Layout/AuthLayout'

// Pages
import NewsFeed from '@/pages/NewsFeed'
import Search from '@/pages/Search'
import NewPost from '@/pages/NewPost'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import VerifyAccount from '@/pages/VerifyAccount'
import AdminDashboard from '@/pages/AdminDashboard'
import Notifications from '@/pages/Notifications'
import Trending from '@/pages/Trending'
import SignIn from '@/pages/Auth/SignIn'
import SignUp from '@/pages/Auth/SignUp'

// Components
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  const { user, loading, initialize } = useAuthStore()
  const { initialize: initializeTheme } = useThemeStore()
  
  useEffect(() => {
    initialize()
    initializeTheme()
  }, [initialize, initializeTheme])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <ErrorBoundary>
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/auth/signin"
              element={
                user ? <Navigate to="/" replace /> : (
                  <AuthLayout>
                    <SignIn />
                  </AuthLayout>
                )
              }
            />
            <Route
              path="/auth/signup"
              element={
                user ? <Navigate to="/" replace /> : (
                  <AuthLayout>
                    <SignUp />
                  </AuthLayout>
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                user ? (
                  <Layout>
                    <Routes>
                      <Route path="/" element={<NewsFeed />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/new-post" element={<NewPost />} />
                      <Route path="/profile/:username?" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/verify" element={<VerifyAccount />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/auth/signin" replace />
                )
              }
            />
          </Routes>
        </ErrorBoundary>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #374151)',
              color: 'var(--toast-color, white)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App