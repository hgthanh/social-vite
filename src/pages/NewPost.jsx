import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, Mic, X, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/UI/Button'
import toast from 'react-hot-toast'

const NewPost = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [audio, setAudio] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh phải nhỏ hơn 5MB')
        return
      }
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video phải nhỏ hơn 100MB')
        return
      }
      if (!file.type.startsWith('video/')) {
        toast.error('Vui lòng chọn file video hợp lệ')
        return
      }
      setVideo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Âm thanh phải nhỏ hơn 10MB')
        return
      }
      setAudio(file)
      setAudioPreview(file.name)
    }
  }

  const uploadFile = async (file, bucket, folder) => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const fileName = `${folder}/${timestamp}-${randomId}-${file.name}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Nội dung bài viết không được để trống')
      return
    }

    if (!image && !video && !audio) {
      toast.error('Vui lòng chọn ít nhất một tệp (ảnh, video hoặc âm thanh)')
      return
    }

    setLoading(true)

    try {
      let imageUrl = null
      let videoUrl = null
      let audioUrl = null

      if (image) {
        imageUrl = await uploadFile(image, 'posts', 'images')
      }

      if (video) {
        videoUrl = await uploadFile(video, 'posts', 'videos')
      }

      if (audio) {
        audioUrl = await uploadFile(audio, 'posts', 'audio')
      }

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            image_url: imageUrl,
            video_url: videoUrl,
            audio_url: audioUrl,
            created_at: new Date().toISOString(),
          }
        ])

      if (error) throw error

      toast.success('Bài viết đã được đăng')
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Có lỗi xảy ra khi đăng bài')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Chia sẻ suy nghĩ của bạn
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-6">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || '')}&background=0ea5e9&color=fff`}
              alt={profile?.display_name}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bạn đang nghĩ gì...?"
                maxLength={500}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={6}
              />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {content.length}/500
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg max-h-96 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="mb-4 relative">
              <video
                src={videoPreview}
                controls
                className="rounded-lg max-h-96 w-full"
              />
              <button
                type="button"
                onClick={() => {
                  setVideo(null)
                  setVideoPreview(null)
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Audio Preview */}
          {audioPreview && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{audioPreview}</span>
              <button
                type="button"
                onClick={() => {
                  setAudio(null)
                  setAudioPreview(null)
                }}
                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Video className="w-5 h-5" />
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!content.trim()}
              >
                Đăng bài
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewPost