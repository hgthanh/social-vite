import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Search } from 'lucide-react'
import { useTrendingStore } from '@/store/trendingStore'
import LoadingSpinner from '@/components/UI/LoadingSpinner'

const Trending = () => {
  const navigate = useNavigate()
  const { trendingTopics, loading, fetchTrendingTopics } = useTrendingStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTrendingTopics()

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchTrendingTopics()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchTrendingTopics])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTrendingTopics()
    setRefreshing(false)
  }

  const handleTopicClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Chủ đề nóng
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {trendingTopics.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Chưa có chủ đề nào nóng
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Các chủ đề có từ 1000 lượt tìm kiếm trở lên sẽ xuất hiện ở đây
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <button
              key={`${topic.query}-${topic.created_date}`}
              onClick={() => handleTopicClick(topic.query)}
              className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {topic.query}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {topic.search_count.toLocaleString('vi-VN')} lượt tìm kiếm
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>💡 Lưu ý:</strong> Danh sách chủ đề nóng được cập nhật mỗi 30 phút và dữ liệu được reset hàng ngày. Chỉ những chủ đề có từ 1.000 lượt tìm kiếm trở lên mới xuất hiện.
        </p>
      </div>
    </div>
  )
}

export default Trending