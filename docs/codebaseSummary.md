# BTC Live Codebase Summary

## Key Components and Their Interactions

1. **App Component**: Main application container
2. **TransactionStatus**: Handles transaction tracking and updates
3. **NotificationSystem**: Manages audio and visual notifications
4. **ThemeProvider**: Handles dark/light mode and accent colors
5. **LocalStorageService**: Manages all local storage operations

## Data Flow

1. User inputs transaction ID
2. API fetches transaction data
3. Status updates are processed
4. Notifications are triggered (if enabled)
5. Data is stored in local storage
6. UI updates based on new status

## External Dependencies

- shadcn UI components
- Blockchain.com API (or similar)
- React ecosystem (React, React DOM)
- Vite build system

## Static Assets

- **Icons**: bitcoin-icon.png, bitcoin-icon.svg
- **Logo**: bitcoin-logo.svg
- **Demo**: demo.gif

## Recent Significant Changes

- Initial project setup
- Documentation creation
- Basic project structure established
- Added static assets for branding
- Implemented CORS handling with Vite proxy for blockchain.info API
- Added proper request headers for API calls
- Added consistent time formatting with 24h format support
- Enhanced transaction details with SegWit info and metrics
- Added notification history with timestamps
- Implemented scrollable notification list
- Changed default audio notifications to off
- Enhanced timestamp display with seconds
- Added automated demo recording functionality with Playwright
- Configured high-quality video capture (1920x1080)
- Implemented natural mouse movements for demo interactions
- Added pre-commit hooks with husky and lint-staged
- Configured automatic code formatting and linting
- Implemented type-safe event emitter system
- Released version 1.0.0 with comprehensive documentation

## API Integration

- Using blockchain.info API through Vite proxy to handle CORS
- Configured proper request headers for API communication
- Local development proxy at /blockchain-api
- Standardized time formatting with configurable options
- Added advanced transaction metrics (SegWit savings, weight units)
- Enhanced date/time display with timezone information
- Implemented type-safe event emitter system
- Added compile-time checking for event names and data
- Improved IntelliSense support for API interactions
- Added proper TypeScript types for all API responses

## User Feedback Integration

- Notification toggles for audio/visual alerts
- Theme customization (dark/light mode)
- Accent color selection
- Added Bitcoin-themed static assets
