<div align="center">

# BTC Live 🚀

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/mikkelgeorgsen/btclive)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn-black.svg)](https://ui.shadcn.com)

Track Bitcoin transactions in real-time with a sleek, modern interface powered by shadcn/ui.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API](#api) • [Contributing](#contributing)

![BTC Live Demo](public/demo.gif)

</div>

## ✨ Features

### 🔄 Real-time Transaction Tracking
- Live status updates with confirmation count
- Mempool monitoring and block confirmations
- Visual progress indicators and animations
- Automatic refresh every 30 seconds

### 🔔 Smart Notifications
- Visual toast notifications for status changes
- Audio alerts for important updates
- Toggleable notification preferences
- Notification history with timestamps

### 🎨 Modern UI & UX
- Dark/Light mode with smooth transitions
- Bitcoin orange accent colors
- Responsive design for all devices
- Beautiful animations and transitions
- Powered by shadcn/ui components

### 📊 Detailed Analytics
- Transaction size and virtual size
- Weight units and fee calculations
- SegWit savings indicator
- Input/Output flow visualization
- Real-time confirmation progress

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mikkelgeorgsen/btclive.git

# Navigate and install dependencies
cd btclive
pnpm install

# Start the development server
pnpm dev
```

Visit `http://localhost:5173` and start tracking transactions!

## 📖 Documentation

### Transaction Tracking

1. **Enter Transaction ID**
   - Paste a Bitcoin transaction ID, or
   - Click "Get Latest Transaction" for recent activity

2. **Monitor Status**
   - Watch real-time confirmation progress
   - View detailed transaction information
   - Track fee rates and SegWit savings

3. **Notification Settings**
   - Toggle visual notifications (🔔)
   - Toggle audio alerts (🔊)
   - View notification history

### Theme Customization

The interface uses Bitcoin orange (#f7931a) as its primary accent color, providing a familiar and branded experience. Toggle between dark and light modes using the theme switch in the header.

### Local Storage

All settings and preferences are stored locally:
- Notification preferences
- Theme selection
- Recent transactions
- Notification history

## 🔧 Development

### Prerequisites
- Node.js 16+
- pnpm package manager
- Modern web browser

### Available Scripts

```bash
# Development mode
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Lint code
pnpm lint

# Record demo video
pnpm record-demo

# Start dev server and record demo
pnpm create-demo
```

### Project Structure

```
btclive/
├── src/
│   ├── components/     # UI components
│   ├── lib/           # Core utilities
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # Global styles
│   └── types/         # TypeScript definitions
├── public/            # Static assets
└── tests/            # Test suites
```

## 🌐 API Integration

### Transaction API

```typescript
import { btcLiveAPI } from '@/lib/api'

// Get latest transaction
const latest = await btcLiveAPI.handleCommand('getLatestTransaction')

// Track specific transaction
await btcLiveAPI.handleCommand('trackTransaction', {
  txId: 'YOUR_TX_ID'
})

// Listen for updates
btcLiveAPI.addEventListener('transactionUpdate', (data) => {
  console.log('New update:', data)
})
```

### WebSocket Events

| Event | Description | Payload |
|-------|-------------|---------|
| `transactionUpdate` | New transaction data | `TransactionData` |
| `statusUpdate` | Confirmation status | `StatusUpdate` |
| `notificationUpdate` | Notification state | `NotificationState` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow the existing code style

## 📝 License

Copyright © 2024 [Mikkel Georgsen](https://github.com/mikkelgeorgsen).
This project is [MIT](LICENSE) licensed.

## 🙏 Acknowledgments

- [blockchain.info API](https://www.blockchain.com/api) for transaction data
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Vite](https://vitejs.dev/) for the blazing fast development experience
- [React](https://reactjs.org/) for the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
