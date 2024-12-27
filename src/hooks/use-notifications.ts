import { useContext } from 'react'

import { NotificationContext } from '../components/notification/NotificationSettings'

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
