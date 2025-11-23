const Test = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ✅ Test Page
        </h1>
        
        <div className="space-y-4 text-left bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Supabase URL:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
              {import.meta.env.VITE_SUPABASE_URL || '❌ UNDEFINED'}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Anon Key:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ UNDEFINED'}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Environment:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {import.meta.env.MODE}
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Nếu bạn thấy trang này, React đang hoạt động bình thường. 
        </p>

        <div className="space-y-2">
          <button
            onClick={() => {
              console.log('Environment:', import.meta.env)
              alert('Check console (F12) để xem chi tiết')
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log Environment to Console
          </button>

          <button
            onClick={() => {
              try {
                const { supabase } = require('@/lib/supabase')
                console.log('Supabase:', supabase)
                alert('✅ Supabase imported successfully')
              } catch (err) {
                console.error('Supabase import error:', err)
                alert('❌ Supabase import failed: ' + err.message)
              }
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Supabase Import
          </button>

          <a
            href="/"
            className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}

export default Test