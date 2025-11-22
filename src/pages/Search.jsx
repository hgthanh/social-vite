import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTrendingStore } from '@/store/trendingStore'
import LoadingSpinner from '@/components/UI/LoadingSpinner'
import { Link } from 'react-router-dom'

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState('users')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const { trackSearch } = useTrendingStore()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTimer = setTimeout(() => {
      performSearch()
      trackSearch(query) // Track search for trending
    }, 300)

    return () => clearTimeout(searchTimer)
  }, [query, searchType])

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      if (searchType === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
          .limit(20)

        if (!error) setResults(data || [])
      } else if (searchType === 'posts') {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              username,
              display_name,
              avatar_url,
              is_verified
            )
          `)
          .or(`content.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20)

        if (!error) setResults(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm người dùng, bài viết..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Type Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setSearchType('users')}
          className={`pb-3 font-medium transition-colors ${
            searchType === 'users'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Người dùng
        </button>
        <button
          onClick={() => setSearchType('posts')}
          className={`pb-3 font-medium transition-colors ${
            searchType === 'posts'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          Bài viết
        </button>
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Bắt đầu tìm kiếm để khám phá nội dung
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Không tìm thấy kết quả nào
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchType === 'users' ? (
            results.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.username}`}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || '')}&background=0ea5e9&color=fff`}
                    alt={user.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {user.display_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            results.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex gap-3 mb-3">
                  <img
                    src={post.profiles?.[0]?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.[0]?.display_name || '')}&background=0ea5e9&color=fff`}
                    alt={post.profiles?.[0]?.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {post.profiles?.[0]?.display_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{post.profiles?.[0]?.username}
                    </p>
                  </div>
                </div>
                <p className="text-gray-900 dark:text-white line-clamp-2">
                  {post.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Search