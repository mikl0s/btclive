import { chromium } from '@playwright/test'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'

async function findVitePort(): Promise<number> {
  try {
    // Try to find the Vite server port from running processes
    const output = execSync('ps aux | grep vite').toString()
    const match = output.match(/localhost:(\d+)/)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
  } catch (error) {
    console.error('Error finding Vite port:', error)
  }
  return 5173 // Default fallback
}

async function recordDemo() {
  // Launch browser
  const browser = await chromium.launch({
    args: ['--window-size=1920,1080']
  })

  const context = await browser.newContext({
    recordVideo: {
      dir: './demos',
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // Start recording
    console.log('Starting demo recording...')

    // Find the actual Vite server port
    const port = await findVitePort()
    const baseUrl = `http://localhost:${port}`
    console.log(`Connecting to Vite server at ${baseUrl}`)

    // Go to application
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    console.log('Page loaded successfully')

    // Demo sequence
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark') // Ensure dark mode
    })

    // 1. Wait for initial UI to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Extra time to ensure all animations complete
    console.log('Initial UI shown')

    // 2. Find and interact with the Latest Transaction button
    try {
      const latestTxButton = await page.getByRole('button', { name: /latest/i })
      const box = await latestTxButton.boundingBox()
      if (!box) throw new Error('Button not visible')

      // Move mouse to button with a natural curve
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 25 // More steps = smoother movement
      })
      await page.waitForTimeout(500) // Hover pause
      await page.mouse.down() // Press
      await page.waitForTimeout(100)
      await page.mouse.up() // Release
      await page.waitForTimeout(2000)
      console.log('Latest transaction button clicked')

      // 3. Find and interact with Track button
      const trackButton = await page.getByRole('button', { name: /track/i })
      const trackBox = await trackButton.boundingBox()
      if (!trackBox) throw new Error('Track button not visible')

      // Move mouse with slight randomization for natural feel
      const startX = box.x + box.width / 2
      const startY = box.y + box.height / 2
      const endX = trackBox.x + trackBox.width / 2
      const endY = trackBox.y + trackBox.height / 2
      
      // Add slight curve to movement
      const controlX = (startX + endX) / 2 + (Math.random() * 50 - 25)
      const controlY = (startY + endY) / 2 + (Math.random() * 50 - 25)
      
      // Simulate curved mouse movement
      for (let i = 0; i <= 30; i++) {
        const t = i / 30
        const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * endX
        const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * endY
        await page.mouse.move(x, y)
        await page.waitForTimeout(10)
      }

      await page.waitForTimeout(500) // Hover pause
      await page.mouse.down()
      await page.waitForTimeout(100)
      await page.mouse.up()
      await page.waitForTimeout(2000)
      console.log('Track button clicked')
    } catch (error) {
      console.log('Button interaction failed:', error)
    }

    // 4. Find and interact with theme toggle
    try {
      const themeButton = await page.getByRole('button', { name: /toggle theme/i })
      const themeBox = await themeButton.boundingBox()
      if (!themeBox) throw new Error('Theme button not visible')

      // Move to theme toggle with natural movement
      await page.mouse.move(themeBox.x + themeBox.width / 2, themeBox.y + themeBox.height / 2, {
        steps: 25 // More steps = smoother movement
      })

      // Toggle to light
      await page.waitForTimeout(500) // Hover pause
      await page.mouse.down()
      await page.waitForTimeout(100)
      await page.mouse.up()
      await page.waitForTimeout(2000)
      console.log('Theme toggled to light')

      // Toggle back to dark
      await page.mouse.down()
      await page.waitForTimeout(100)
      await page.mouse.up()
      await page.waitForTimeout(2000)
      console.log('Theme toggled back to dark')
    } catch (error) {
      console.log('Theme toggle interaction failed:', error)
    }

    // Wait a bit after theme toggles before proceeding
    await page.waitForTimeout(3000)

    // 5. Toggle notifications using API directly for reliability
    console.log('Toggling notifications...')
    
    // Toggle visual notifications off
    await page.evaluate(() => {
      const api = (window as any).btcLiveAPI
      api.handleCommand('toggleVisual')
    })
    await page.waitForTimeout(2000)
    console.log('Visual notifications toggled')

    // Toggle visual notifications back on
    await page.evaluate(() => {
      const api = (window as any).btcLiveAPI
      api.handleCommand('toggleVisual')
    })
    await page.waitForTimeout(2000)
    console.log('Visual notifications toggled back')

    // Toggle audio notifications off
    await page.evaluate(() => {
      const api = (window as any).btcLiveAPI
      api.handleCommand('toggleAudio')
    })
    await page.waitForTimeout(2000)
    console.log('Audio notifications toggled')

    // Toggle audio notifications back on
    await page.evaluate(() => {
      const api = (window as any).btcLiveAPI
      api.handleCommand('toggleAudio')
    })
    await page.waitForTimeout(2000)
    console.log('Audio notifications toggled back')

    // Final pause before ending
    await page.waitForTimeout(3000)

    // End recording
    await context.close()
    await browser.close()

    console.log('Demo recording completed!')
    console.log('Video saved in ./demos directory')

  } catch (error) {
    console.error('Error during demo recording:', error)
    await browser.close()
    process.exit(1)
  }
}

// Create demos directory if it doesn't exist
import { mkdirSync } from 'fs'
try {
  mkdirSync('./demos', { recursive: true })
} catch (error) {
  // Directory already exists
}

// Run the demo
recordDemo().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})