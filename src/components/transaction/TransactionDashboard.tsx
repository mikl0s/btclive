import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle, Circle, Clock, Coins, Database, Info } from 'lucide-react'
import { useCallback, useContext, useEffect, useState } from 'react'

import {
  calculateConfirmations,
  calculateFee,
  calculateSegwitSavings,
  calculateTotalInput,
  calculateTotalOutput,
  calculateVirtualSize,
  calculateWeightUnits,
  formatTime,
  getFeeRate,
  getLatestBlock,
  getTransactionDetails,
  type TransactionData,
} from '../../lib/api'
import { NotificationContext, NotificationHistory } from '../notification/NotificationSettings'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CountdownTimer } from '../ui/countdown-timer'
import { Progress } from '../ui/progress'

interface TransactionDashboardProps {
  txId: string
}

interface TransactionStatus {
  data: TransactionData | null
  confirmations: number
  status: 'pending' | 'confirmed' | 'mempool'
  error: string | null
  latestBlock: number
  lastRefresh?: Date
}

interface StatusInfo {
  variant: 'success' | 'warning' | 'info' | 'default'
  label: string
  description: string
}

export function TransactionDashboard({ txId }: TransactionDashboardProps) {
  const [status, setStatus] = useState<TransactionStatus>({
    data: null,
    confirmations: 0,
    status: 'mempool',
    error: null,
    latestBlock: 0,
  })

  const { playNotification } = useContext(NotificationContext)

  const getStatusInfo = (status: TransactionStatus['status']): StatusInfo => {
    switch (status) {
      case 'confirmed':
        return {
          variant: 'success',
          label: 'Confirmed',
          description: 'Transaction confirmed in blockchain (6+ confirmations)',
        }
      case 'pending':
        return {
          variant: 'warning',
          label: 'Pending',
          description: 'Transaction included in a block, awaiting more confirmations',
        }
      case 'mempool':
        return {
          variant: 'info',
          label: 'In Mempool',
          description: 'Transaction is in the memory pool, waiting to be included in a block',
        }
      default:
        return {
          variant: 'default',
          label: 'Unknown',
          description: 'Unknown transaction status',
        }
    }
  }

  const fetchAndUpdateData = useCallback(async () => {
    try {
      const [tx, latestBlock] = await Promise.all([getTransactionDetails(txId), getLatestBlock()])

      const confirmations = calculateConfirmations(tx.block_height, latestBlock)
      const newStatus = confirmations >= 6 ? 'confirmed' : confirmations > 0 ? 'pending' : 'mempool'

      setStatus(prev => {
        const isInitialLoad = !prev.lastRefresh
        const statusChanged = !isInitialLoad && prev.status !== newStatus
        const confirmationsChanged =
          !isInitialLoad && prev.confirmations !== confirmations && confirmations > 0

        // Only notify for actual changes, not initial load
        if (!isInitialLoad && (statusChanged || confirmationsChanged)) {
          const statusInfo = getStatusInfo(newStatus)
          const message = confirmationsChanged
            ? `Confirmations: ${confirmations}`
            : `Status: ${statusInfo.label} - ${statusInfo.description}`
          playNotification(message)
        }

        return {
          data: tx,
          confirmations,
          status: newStatus,
          error: null,
          latestBlock,
          lastRefresh: new Date(),
        }
      })
    } catch (error) {
      console.error('Fetch error:', error)
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch transaction data',
      }))
    }
  }, [txId, playNotification])

  // Initial fetch
  useEffect(() => {
    fetchAndUpdateData()
  }, [fetchAndUpdateData])

  if (status.error) {
    return (
      <Card className="bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{status.error}</p>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo(status.status)

  return (
    <AnimatePresence>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Transaction ID */}
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="mb-2">Transaction ID</CardTitle>
                  <code className="text-sm bg-muted p-2 rounded">{txId}</code>
                </div>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Confirmation Progress */}
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Confirmation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={(status.confirmations / 6) * 100} />
                <div className="flex items-center justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        {i < status.confirmations ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : i === status.confirmations ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Clock className="w-8 h-8 text-yellow-500" />
                          </motion.div>
                        ) : (
                          <Circle className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground mt-2">Block {i + 1}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <div className="text-right">
                    <Badge variant={statusInfo.variant} className="mb-1">
                      {statusInfo.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Confirmations</span>
                  <span className="font-medium">{status.confirmations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Block Time</span>
                  <span className="font-medium">
                    {status.data ? formatTime(status.data.time) : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{status.data ? status.data.version : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lock Time</span>
                  <span className="font-medium">{status.data ? status.data.lock_time : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Refresh</span>
                  <span className="font-medium">
                    {status.lastRefresh
                      ? formatTime(Math.floor(status.lastRefresh.getTime() / 1000), {
                          includeDate: false,
                          includeTimezone: true,
                          includeSeconds: true,
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Update</span>
                  <CountdownTimer
                    interval={30000}
                    onComplete={fetchAndUpdateData}
                    className="w-32"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">
                    {status.data ? status.data.size.toLocaleString() : '-'} bytes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Virtual Size</span>
                  <span className="font-medium">
                    {status.data ? calculateVirtualSize(status.data) : '-'} vB
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weight Units</span>
                  <span className="font-medium">
                    {status.data ? calculateWeightUnits(status.data) : '-'} WU
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">
                    {status.data ? calculateFee(status.data).toFixed(8) : '-'} BTC
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fee Rate</span>
                  <span className="font-medium">{status.data ? getFeeRate(status.data) : '-'}</span>
                </div>
                {status.data && calculateSegwitSavings(status.data) && (
                  <div className="flex items-center justify-between text-green-500">
                    <span className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      SegWit Savings
                    </span>
                    <span className="font-medium">{calculateSegwitSavings(status.data)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Flow Diagram */}
          <motion.div
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Transaction Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <motion.div
                    className="flex-1 bg-muted p-4 rounded-lg text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Database className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">
                      {status.data ? calculateTotalInput(status.data).toFixed(8) : '-'} BTC
                    </div>
                    <div className="text-sm text-muted-foreground">Total Input</div>
                  </motion.div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <motion.div
                    className="flex-1 bg-muted p-4 rounded-lg text-center"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Coins className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">
                      {status.data ? calculateTotalOutput(status.data).toFixed(8) : '-'} BTC
                    </div>
                    <div className="text-sm text-muted-foreground">Total Output</div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Notification History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NotificationHistory />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
