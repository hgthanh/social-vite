import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useTrendingStore = create((set, get) => ({
  trendingTopics: [],
  loading: false,

  fetchTrendingTopics: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('search_queries')
        .select('query, search_count, created_date')
        .gte('search_count', 1000)
        .gte('created_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('search_count', { ascending: false })
        .limit(10)

      if (!error) {
        set({ trendingTopics: data || [] })
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error)
    } finally {
      set({ loading: false })
    }
  },

  trackSearch: async (query) => {
    if (!query.trim() || query.length < 2) return

    try {
      const today = new Date().toISOString().split('T')[0]

      // Check if search query already exists for today
      const { data: existing, error: selectError } = await supabase
        .from('search_queries')
        .select('*')
        .eq('query', query.toLowerCase().trim())
        .eq('created_date', today)
        .single()

      if (existing) {
        // Update search count
        await supabase
          .from('search_queries')
          .update({ search_count: existing.search_count + 1 })
          .eq('id', existing.id)
      } else {
        // Create new search query record
        await supabase
          .from('search_queries')
          .insert([
            {
              query: query.toLowerCase().trim(),
              search_count: 1,
              created_date: today
            }
          ])
      }

      // Refresh trending topics if count reached 1000
      const { data: updated } = await supabase
        .from('search_queries')
        .select('search_count')
        .eq('query', query.toLowerCase().trim())
        .eq('created_date', today)
        .single()

      if (updated?.search_count % 100 === 0) {
        // Refresh every 100 searches to update trending
        get().fetchTrendingTopics()
      }
    } catch (error) {
      console.error('Error tracking search:', error)
    }
  },

  // Clean up old search data (run daily)
  cleanupOldSearchData: async () => {
    try {
      const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      await supabase
        .from('search_queries')
        .delete()
        .lt('created_date', yesterday)
    } catch (error) {
      console.error('Error cleaning up search data:', error)
    }
  }
}))