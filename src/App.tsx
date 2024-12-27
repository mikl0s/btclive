import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "./components/mode-toggle"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { TransactionDashboard } from "./components/transaction/TransactionDashboard"
import { NotificationSettings, NotificationProvider } from "./components/notification/NotificationSettings"
import { Toaster } from "./components/ui/toaster"
import { motion, AnimatePresence } from "framer-motion"
import { getLatestTransaction } from "./lib/api"
import { useToast } from "./components/ui/use-toast"

function App() {
  const [txId, setTxId] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTrack = () => {
    if (!txId.trim()) return
    setIsTracking(true)
  }

  const handleGetLatest = async () => {
    try {
      setIsLoading(true)
      const latest = await getLatestTransaction()
      setTxId(latest.hash)
      toast({
        title: "Latest Transaction Found",
        description: "Latest unconfirmed transaction loaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch latest transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="btc-live-theme">
      <NotificationProvider>
        <div className="min-h-screen bg-background text-foreground">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img
                src="/bitcoin-icon.svg"
                alt="BTC Live Logo"
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold">BTC Live</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationSettings />
              <ModeToggle />
            </div>
          </header>
          <main className="container mx-auto p-4">
            <AnimatePresence mode="wait">
              {!isTracking ? (
                <motion.section
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-10 text-center"
                >
                  <h2 className="text-4xl font-bold mb-4">
                    Real-Time Bitcoin Transaction Tracking
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8">
                    Enter a Bitcoin transaction ID to track its status in real-time
                  </p>
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="text-lg font-mono"
                        style={{ letterSpacing: '0.025em' }}
                      />
                      <Button 
                        onClick={handleTrack}
                        size="lg"
                        className="px-8 min-w-[120px]"
                        disabled={!txId.trim() || isLoading}
                      >
                        Track
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleGetLatest}
                        disabled={isLoading}
                        className="w-full max-w-xs"
                      >
                        {isLoading ? "Loading..." : "Get Latest Transaction"}
                      </Button>
                    </div>
                  </div>
                </motion.section>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Transaction Details</h2>
                    <Button
                      variant="outline"
                      onClick={() => setIsTracking(false)}
                    >
                      Track Another Transaction
                    </Button>
                  </div>
                  <TransactionDashboard txId={txId} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
