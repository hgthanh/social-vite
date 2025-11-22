import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const CreatePostQuick = ({ onPostCreated }) => {
  const navigate = useNavigate()
  const { profile } = useAuthStore()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex gap-4">
        <img
          src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || '')}&background=0ea5e9&color=fff`}
          alt={profile?.display_name}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <button
            onClick={() => navigate('/new-post')}
            className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Bạn đang nghĩ gì...
          </button>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => navigate('/new-post')}
              className="px-6 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition-colors"
            >
              Đăng bài
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePostQuick