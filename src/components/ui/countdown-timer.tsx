import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "../../lib/utils"
import { Progress } from "../../components/ui/progress"

interface CountdownTimerProps {
  interval: number // in milliseconds
  onComplete?: () => void
  className?: string
}

export function CountdownTimer({ interval, onComplete, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(interval)
  const [isRunning, setIsRunning] = useState(true)
  const timerRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef(Date.now())

  const resetTimer = useCallback(() => {
    setTimeLeft(interval)
    setIsRunning(true)
    startTimeRef.current = Date.now()
  }, [interval])

  const handleComplete = useCallback(() => {
    setIsRunning(false)
    if (onComplete) {
      try {
        onComplete()
      } catch (error) {
        console.error('Error in onComplete callback:', error)
      }
      // Reset timer after completion
      setTimeout(resetTimer, 100)
    }
  }, [onComplete, resetTimer])

  useEffect(() => {
    if (!isRunning) return

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const remaining = interval - elapsed

      if (remaining <= 0) {
        handleComplete()
      } else {
        setTimeLeft(remaining)
      }
    }

    timerRef.current = setInterval(updateTimer, 100)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [interval, handleComplete, isRunning])

  // Reset timer if interval changes
  useEffect(() => {
    resetTimer()
  }, [interval, resetTimer])

  const progress = (timeLeft / interval) * 100

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={progress} className="w-24" />
      <span className="text-sm text-muted-foreground">
        {Math.ceil(timeLeft / 1000)}s
      </span>
    </div>
  )
}