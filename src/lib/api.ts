const API_BASE = '/blockchain-api'

export interface TransactionData {
  hash: string
  time: number
  block_height?: number
  size: number
  fee: number
  inputs: Array<{ prev_out: { value: number } }>
  out: Array<{ value: number }>
  weight?: number
  version: number
  lock_time: number
  vin_sz: number
  vout_sz: number
  vsize?: number // Virtual size for SegWit
}

export interface TransactionDetails extends TransactionData {
  segwitSavings?: number // Calculated savings percentage
  weightUnits?: number // Weight units (WU)
}

export interface LatestTransaction {
  hash: string
  time: number
  block_height?: number
}

export interface TimeFormatOptions {
  hour12?: boolean
  includeSeconds?: boolean
  includeDate?: boolean
  includeTimezone?: boolean
}

export function formatTime(
  timestamp: number,
  options: TimeFormatOptions = {
    hour12: false,
    includeSeconds: true,
    includeDate: true,
    includeTimezone: true
  }
): string {
  const date = new Date(timestamp * 1000)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()

  let parts: string[] = []

  // Format the time part first
  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: options.includeSeconds ? '2-digit' : undefined,
    hour12: false,
    timeZone
  }).format(date)

  // Date part
  if (options.includeDate) {
    if (isToday) {
      parts.push('Today')
    } else if (isYesterday) {
      parts.push('Yesterday')
    } else {
      const datePart = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date)
      parts.push(datePart)
    }
  }

  // Add time part
  parts.push(timePart)

  // Timezone part
  if (options.includeTimezone) {
    // Map common timezone names to shorter versions
    const tzMap: Record<string, string> = {
      'Europe/Copenhagen': 'CET',
      'Europe/Paris': 'CET',
      'Europe/Berlin': 'CET',
      // Add more mappings as needed
    }
    parts.push(tzMap[timeZone] || timeZone.split('/').pop() || timeZone)
  }

  return parts.join(' ')
}

export async function getTransactionDetails(txId: string): Promise<TransactionData> {
  const response = await fetch(`${API_BASE}/rawtx/${txId}`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch transaction data')
  }
  return response.json()
}

// Rate limiting helper
const rateLimiter = {
  lastCall: 0,
  minInterval: 2000, // Minimum 2 seconds between calls
  async throttle() {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCall
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastCall))
    }
    this.lastCall = Date.now()
  }
}

export async function getLatestBlock(): Promise<number> {
  await rateLimiter.throttle()
  try {
    const response = await fetch(`${API_BASE}/latestblock`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    })
    if (!response.ok) {
      if (response.status === 429) {
        // On rate limit, wait and retry once
        await new Promise(resolve => setTimeout(resolve, 5000))
        return getLatestBlock()
      }
      throw new Error('Failed to fetch latest block')
    }
    const data = await response.json()
    return data.height
  } catch (error) {
    console.error('Error fetching latest block:', error)
    return 0 // Return 0 to prevent breaking the UI
  }
}

export async function getLatestTransaction(): Promise<LatestTransaction> {
  const response = await fetch(`${API_BASE}/unconfirmed-transactions?format=json`, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error('Failed to fetch latest transactions')
  }
  const data = await response.json()
  const latest = data.txs[0]
  return {
    hash: latest.hash,
    time: latest.time,
    block_height: latest.block_height
  }
}

export function calculateConfirmations(
  blockHeight: number | undefined,
  latestBlock: number
): number {
  if (!blockHeight) return 0
  return Math.max(0, latestBlock - blockHeight + 1)
}

export function formatBitcoinAmount(satoshis: number): number {
  return satoshis / 100000000
}

export function calculateTotalInput(tx: TransactionData): number {
  return formatBitcoinAmount(
    tx.inputs.reduce((sum, input) => sum + (input.prev_out?.value || 0), 0)
  )
}

export function calculateTotalOutput(tx: TransactionData): number {
  return formatBitcoinAmount(
    tx.out.reduce((sum, output) => sum + (output.value || 0), 0)
  )
}

export function calculateFee(tx: TransactionData): number {
  return formatBitcoinAmount(tx.fee)
}

export function calculateSegwitSavings(tx: TransactionData): number | undefined {
  if (!tx.vsize || !tx.size) return undefined
  const savings = ((tx.size - tx.vsize) / tx.size) * 100
  return Math.round(savings)
}

export function calculateWeightUnits(tx: TransactionData): number {
  return tx.weight || tx.size * 4
}

export function calculateVirtualSize(tx: TransactionData): number {
  return tx.vsize || Math.ceil(calculateWeightUnits(tx) / 4)
}

export function getFeeRate(tx: TransactionData): string {
  const vsize = calculateVirtualSize(tx)
  const feeRate = (tx.fee / vsize).toFixed(1)
  return `${feeRate} sat/vB`
}

export interface NotificationSettings {
  visual: boolean
  audio: boolean
}

export interface APIResponse {
  success: boolean
  data?: any
  error?: string
}

export class BTCLiveAPI {
  private static instance: BTCLiveAPI
  private eventListeners: Map<string, ((data: any) => void)[]>
  private notificationSettings: NotificationSettings

  private constructor() {
    this.eventListeners = new Map()
    const stored = localStorage.getItem("notification-settings")
    this.notificationSettings = stored ? JSON.parse(stored) : { visual: true, audio: false }
  }

  static getInstance(): BTCLiveAPI {
    if (!BTCLiveAPI.instance) {
      BTCLiveAPI.instance = new BTCLiveAPI()
    }
    return BTCLiveAPI.instance
  }

  addEventListener(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)?.push(callback)
  }

  removeEventListener(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Notification Control Methods
  enableVisual(): void {
    this.updateNotificationSettings({ visual: true })
  }

  disableVisual(): void {
    this.updateNotificationSettings({ visual: false })
  }

  enableAudio(): void {
    this.updateNotificationSettings({ audio: true })
  }

  disableAudio(): void {
    this.updateNotificationSettings({ audio: false })
  }

  toggleVisual(): void {
    this.updateNotificationSettings({ visual: !this.notificationSettings.visual })
  }

  toggleAudio(): void {
    this.updateNotificationSettings({ audio: !this.notificationSettings.audio })
  }

  getNotificationSettings(): NotificationSettings {
    return { ...this.notificationSettings }
  }

  private updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    this.notificationSettings = { ...this.notificationSettings, ...settings }
    localStorage.setItem("notification-settings", JSON.stringify(this.notificationSettings))
    this.emit('notificationSettingsChanged', this.notificationSettings)
  }

  async handleCommand(command: string, params: any = {}): Promise<APIResponse> {
    try {
      switch (command) {
        case 'getLatestTransaction':
          const tx = await getLatestTransaction()
          this.emit('transactionUpdate', tx)
          return { success: true, data: tx }

        case 'trackTransaction':
          if (!params.txId) {
            return { success: false, error: 'Transaction ID required' }
          }
          const txData = await getTransactionDetails(params.txId)
          this.emit('transactionUpdate', txData)
          return { success: true, data: txData }

        case 'getStatus':
          const [transaction, block] = await Promise.all([
            getTransactionDetails(params.txId),
            getLatestBlock()
          ])
          const confirmations = calculateConfirmations(transaction.block_height, block)
          const status = {
            transaction,
            confirmations,
            block
          }
          this.emit('statusUpdate', status)
          return { success: true, data: status }

        case 'toggleVisual':
          this.toggleVisual()
          return { success: true, data: this.notificationSettings }

        case 'toggleAudio':
          this.toggleAudio()
          return { success: true, data: this.notificationSettings }

        case 'getNotificationSettings':
          return { success: true, data: this.getNotificationSettings() }

        default:
          return { success: false, error: 'Unknown command' }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export singleton instance
export const btcLiveAPI = BTCLiveAPI.getInstance()