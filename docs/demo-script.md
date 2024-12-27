# BTC Live Demo Script

## Setup
1. Start the development server:
```bash
pnpm run dev
```

## Recording Tools

### Linux (Ubuntu/Debian)
1. **SimpleScreenRecorder**:
   ```bash
   sudo apt install simplescreenrecorder
   ```
   - Easy to use GUI
   - Supports custom area selection
   - Can record system audio

2. **OBS Studio**:
   ```bash
   sudo apt install obs-studio
   ```
   - Professional-grade recording
   - Streaming capabilities
   - Scene composition

3. **Kazam**:
   ```bash
   sudo apt install kazam
   ```
   - Lightweight and simple
   - Area selection
   - Keyboard shortcut support

### macOS
1. **Built-in Screen Recording**:
   - Press `Shift + Command + 5`
   - Select area or window
   - Choose recording options

2. **OBS Studio**:
   ```bash
   brew install --cask obs
   ```

### Windows
1. **Built-in Xbox Game Bar**:
   - Press `Windows + G`
   - Click record button

2. **OBS Studio**:
   - Download from https://obsproject.com/

## Demo Flow

1. **Initial Setup** (30 seconds)
   - Show dark mode by default
   - Demonstrate notification toggles
   - Show accent color selection

2. **Transaction Tracking** (1-2 minutes)
   - Enter a Bitcoin transaction ID
   - Show real-time status updates
   - Point out the confirmation progress
   - Highlight SegWit savings if present

3. **Notification System** (1 minute)
   - Toggle notifications on/off
   - Show notification history
   - Demonstrate sound notifications
   - Use API commands to toggle notifications:
     ```javascript
     // Open browser console and run:
     await btcLiveAPI.handleCommand('toggleVisual')
     await btcLiveAPI.handleCommand('toggleAudio')
     ```

4. **Transaction Details** (1 minute)
   - Show detailed metrics
   - Explain weight units and virtual size
   - Demonstrate fee calculations
   - Point out timezone in timestamps

## Recording Tips
1. Set resolution to 1920x1080 for best quality
2. Use a clean browser window (no extensions/bookmarks)
3. Test audio levels before full recording
4. Consider adding captions or annotations in post
5. Keep demo under 5 minutes total
6. Focus on one feature at a time
7. Show both light and dark modes

## Post-Recording
- Add intro/outro slides if needed
- Include links to GitHub repository
- Add chapter markers for different sections
- Include system requirements
- Show installation commands