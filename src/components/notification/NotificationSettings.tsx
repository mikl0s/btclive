import { History, MessageSquare, Volume2 } from 'lucide-react'
import { createContext, useContext, useEffect, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ScrollArea } from '../../components/ui/scroll-area'
import { Switch } from '../../components/ui/switch'
import { useToast } from '../../components/ui/use-toast'
import { formatTime } from '../../lib/api'

interface NotificationSettings {
  visual: boolean
  audio: boolean
}

interface NotificationItem {
  message: string
  timestamp: number
}

export const NotificationContext = createContext<{
  settings: NotificationSettings
  setSettings: (settings: NotificationSettings) => void
  history: NotificationItem[]
  playNotification: (message: string) => void
}>({
  settings: { visual: true, audio: true },
  setSettings: () => {},
  history: [],
  playNotification: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem('notification-settings')
    return stored ? JSON.parse(stored) : { visual: true, audio: false }
  })

  const [history, setHistory] = useState<NotificationItem[]>(() => {
    const stored = localStorage.getItem('notification-history')
    return stored ? JSON.parse(stored) : []
  })

  const { toast } = useToast()

  const playNotification = (message: string) => {
    const newNotification = {
      message,
      timestamp: Date.now() / 1000, // Convert to seconds to match Bitcoin timestamps
    }

    setHistory(prev => {
      const updated = [newNotification, ...prev].slice(0, 50) // Keep last 50 notifications
      localStorage.setItem('notification-history', JSON.stringify(updated))
      return updated
    })

    if (settings.audio) {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(console.error)
    }
    if (settings.visual) {
      toast({
        title: 'Transaction Update',
        description: message,
      })
    }
  }

  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings))
  }, [settings])

  return (
    <NotificationContext.Provider value={{ settings, setSettings, history, playNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function NotificationHistory() {
  const { history } = useContext(NotificationContext)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No notifications yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Notification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          {history.map((notification, index) => (
            <div key={index} className="mb-4 last:mb-0 p-3 bg-muted rounded-lg">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTime(notification.timestamp, {
                  includeDate: true,
                  includeTimezone: true,
                })}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function NotificationSettings() {
  const { settings, setSettings, playNotification } = useContext(NotificationContext)
  const [localSettings, setLocalSettings] = useState(settings)

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...localSettings, ...newSettings }
    setLocalSettings(updated)
    setSettings(updated) // Sync with global state
    localStorage.setItem('notification-settings', JSON.stringify(updated))

    // Show a test notification when enabling
    if (newSettings.visual && !settings.visual) {
      playNotification('Visual notifications enabled')
    }
    if (newSettings.audio && !settings.audio) {
      playNotification('Audio notifications enabled')
    }
  }

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch
          checked={localSettings.visual}
          onCheckedChange={checked => updateSettings({ visual: checked })}
          className="data-[state=checked]:bg-primary"
        />
        <MessageSquare className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={localSettings.audio}
          onCheckedChange={checked => updateSettings({ audio: checked })}
          className="data-[state=checked]:bg-primary"
        />
        <Volume2 className="h-4 w-4" />
      </div>
    </div>
  )
}
