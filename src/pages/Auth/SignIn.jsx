import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Github } from 'lucide-react'
import toast from 'react-hot-toast'

import { signIn, signInWithGoogle, signInWithGithub } from '@/lib/supabase'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const { error } = await signIn(email, password)
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Email hoặc mật khẩu không đúng' })
        } else {
          setErrors({ general: error.message })
        }
      } else {
        toast.success('Đăng nhập thành công!')
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra, vui lòng thử lại' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        toast.error('Không thể đăng nhập với Google')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleGithubSignIn = async () => {
    try {
      const { error } = await signInWithGithub()
      if (error) {
        toast.error('Không thể đăng nhập với Github')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="Nhập email của bạn"
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!email || !password}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Hoặc đăng nhập bằng
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              onClick={handleGithubSignIn}
              className="w-full"
            >
              <Github className="w-5 h-5 mr-2" />
              Github
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Đăng ký ngay
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default SignIn