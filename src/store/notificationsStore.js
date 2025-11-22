import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  // Initialize real-time subscription
  initializeNotifications: (userId) => {
    // Fetch existing notifications
    get().fetchNotifications(userId)
    
    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new
          set((state) => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }))
        }
      )
      .subscribe()
    
    return () => supabase.removeChannel(channel)
  },

  fetchNotifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error) {
        const unreadCount = data?.filter(n => !n.is_read).length || 0
        set({
          notifications: data || [],
          unreadCount
        })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (!error) {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (!error) {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        }))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (!error) {
        set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId)
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: notification?.is_read ? state.unreadCount : Math.max(0, state.unreadCount - 1)
          }
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  },

  // Create notification helper
  createNotification: async (recipientId, senderId, type, content, relatedId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: recipientId,
            sender_id: senderId,
            type,
            content,
            related_id: relatedId,
            is_read: false,
            created_at: new Date().toISOString()
          }
        ])

      if (error) console.error('Error creating notification:', error)
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }
}))