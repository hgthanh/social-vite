import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { user } = get()
        const newProfile = {
          id: userId,
          username: user?.email?.split('@')[0] || '',
          display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
          bio: '',
          avatar_url: user?.user_metadata?.avatar_url || null,
          is_verified: false,
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          likes_count: 0,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (!createError) {
          set({ profile: createdProfile })
        }
      } else if (!error) {
        set({ profile: data })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user } = get()
      if (!user) return { error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (!error) {
        set({ profile: data })
        return { data, error: null }
      }
      return { data: null, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))