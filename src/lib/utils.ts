import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBitcoinAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(amount)
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) return defaultValue
  try {
    return JSON.parse(stored)
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
