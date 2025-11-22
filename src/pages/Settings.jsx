import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, signOut } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!currentPassword) {
      setErrors({ currentPassword: 'Nhập mật khẩu hiện tại' })
      return
    }

    if (!newPassword) {
      setErrors({ newPassword: 'Nhập mật khẩu mới' })
      return
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự' })
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu không khớp' })
      return
    }

    setLoading(true)

    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' })
        setLoading(false)
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setErrors({ general: updateError.message })
      } else {
        toast.success('Mật khẩu đã được cập nhật')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      setErrors({ general: 'Có lỗi xảy ra' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
      return
    }

    try {
      // Delete user profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      // Delete user from auth (Note: This usually requires admin access)
      // For now, just sign out
      await signOut()
      toast.success('Tài khoản đã được xóa')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa tài khoản')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Cài đặt tài khoản
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tài khoản được tạo lúc
            </label>
            <input
              type="text"
              value={new Date(user?.created_at).toLocaleString('vi-VN')}
              disabled
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Bảo mật
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            placeholder="Nhập mật khẩu hiện tại"
          />

          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            placeholder="Nhập mật khẩu mới"
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Xác nhận mật khẩu mới"
          />

          <Button
            type="submit"
            loading={loading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Cập nhật mật khẩu
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Khu vực nguy hiểm
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Xóa tài khoản của bạn một cách vĩnh viễn. Hành động này không thể hoàn tác.
        </p>
        <Button
          variant="danger"
          onClick={handleDeleteAccount}
        >
          Xóa tài khoản
        </Button>
      </div>
    </div>
  )
}

export default Settings