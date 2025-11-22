import { useState } from 'react'
import { CheckCircle, Clock, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/UI/Button'
import toast from 'react-hot-toast'

const VerifyAccount = () => {
  const { profile } = useAuthStore()
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitRequest = async (e) => {
    e.preventDefault()

    if (!reason.trim() || !evidence.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)

    try {
      // In a real app, this would send the verification request to an admin
      // For now, we'll just show a success message
      toast.success('Yêu cầu xác minh tài khoản đã được gửi. Vui lòng đợi phê duyệt từ quản trị viên.')
      setReason('')
      setEvidence('')
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-primary-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tích xác minh
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Tài khoản được xác minh giúp người khác tin tưởng bạn hơn. Hãy gửi yêu cầu xác minh để nhận được dấu tick xanh.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trạng thái hiện tại
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {profile?.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.is_verified
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
            }`}>
              {profile?.is_verified ? '✓' : 'Chờ xử lý'}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Request Form */}
      {!profile?.is_verified && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Gửi yêu cầu xác minh
          </h2>

          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý do xin xác minh *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Chọn lý do</option>
                <option value="public_figure">Nhân vật công chúng</option>
                <option value="brand">Thương hiệu/Công ty</option>
                <option value="creator">Tác giả nội dung</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chứng minh danh tính *
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                maxLength={500}
                placeholder="Vui lòng cung cấp thông tin chi tiết về lý do xin xác minh (liên kết trang web, trang mạng xã hội chính thức, v.v.)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 resize-none"
                rows={5}
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {evidence.length}/500
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được kiểm tra bởi đội quản trị. Quá trình xét duyệt có thể mất từ 1-7 ngày.
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={!reason || !evidence.trim()}
              className="w-full"
            >
              Gửi yêu cầu
            </Button>
          </form>
        </div>
      )}

      {profile?.is_verified && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-2">
            Tài khoản của bạn đã được xác minh
          </h3>
          <p className="text-green-700 dark:text-green-400">
            Cảm ơn bạn vì đã là một phần của cộng đồng Thazh Social!
          </p>
        </div>
      )}

      {/* Requirements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Yêu cầu xác minh
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li>✓ Tài khoản phải hoạt động ít nhất 7 ngày</li>
          <li>✓ Hồ sơ phải hoàn chỉnh (avatar, tên hiển thị, tiểu sử)</li>
          <li>✓ Không có hoạt động vi phạm chính sách</li>
          <li>✓ Cung cấp bằng chứng xác thực danh tính</li>
          <li>✓ Tài khoản phải công khai</li>
        </ul>
      </div>
    </div>
  )
}

export default VerifyAccount