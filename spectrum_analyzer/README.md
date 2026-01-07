# Voice Recorder & Waveform Visualizer

A browser-based JavaScript application that records 15 seconds of audio using your microphone and displays a beautiful waveform visualization on a canvas. Built with pure JavaScript using Web Audio API and Canvas API.

## Features

- **15-Second Voice Recording**: Automatically records audio for exactly 15 seconds
- **Waveform Visualization**: Beautiful oscilloscope-style waveform display with gradient colors and glow effects
- **Audio Playback**: Listen to your recording after it completes
- **Modern UI**: Dark-themed, responsive interface with smooth animations
- **Real-time Countdown**: Visual timer showing remaining recording time
- **Microphone Access**: Secure microphone permission handling with user-friendly error messages
- **No External Dependencies**: Built entirely with native browser APIs

## Technology Stack

- **Web Audio API**: Audio analysis and processing
- **MediaStream API**: Microphone access
- **MediaRecorder API**: Audio recording
- **Canvas API**: Waveform visualization
- **Pure JavaScript**: No frameworks or libraries required

## Project Structure

```
spectrum_analyzer/
├── index.html              # Main HTML with UI controls
├── css/
│   └── styles.css         # Styling and layout
├── js/
│   ├── audioCapture.js    # Microphone access and recording logic
│   ├── audioAnalyzer.js   # Web Audio API setup with AnalyserNode
│   ├── waveformRenderer.js # Canvas-based waveform visualization
│   └── app.js             # Main application controller
└── README.md              # This file
```

## How to Use

1. **Open the Application**
   - Open `index.html` in a modern web browser (Chrome, Firefox, Edge, or Safari)
   - The application runs entirely in the browser - no server required

2. **Grant Microphone Permission**
   - Click the "Start Recording" button
   - Allow microphone access when prompted by your browser
   - If denied, you'll receive a helpful error message with instructions

3. **Record Audio**
   - Recording starts automatically after permission is granted
   - Watch the countdown timer (15s → 0s)
   - Speak into your microphone
   - Recording stops automatically after 15 seconds

4. **View Waveform**
   - After recording completes, the waveform appears on the canvas
   - The visualization shows the audio amplitude over time
   - Green gradient waveform with glow effect for visual appeal

5. **Play Recording**
   - Click the "Play Recording" button to listen to your recording
   - The button becomes enabled after recording completes
   - You can replay the recording as many times as you want

6. **Record Again**
   - Click "Start New Recording" to create another recording
   - Previous recording will be replaced

## Browser Compatibility

### Fully Supported
- **Chrome/Edge**: 80+ (recommended)
- **Firefox**: 75+
- **Safari**: 14+ (may require user interaction to start AudioContext)

### Requirements
- Modern browser with Web Audio API support
- Microphone access
- JavaScript enabled
- HTTPS or localhost (required for microphone access in production)

## Technical Details

### Recording Specifications
- **Duration**: 15 seconds (fixed)
- **Format**: audio/webm (browser default)
- **Audio Bitrate**: 128kbps
- **Sample Processing**: Downsampled to 1600 points for visualization

### Web Audio API Configuration
- **FFT Size**: 2048 samples
- **Smoothing**: 0.8
- **Min Decibels**: -90
- **Max Decibels**: -10

### Canvas Specifications
- **Dimensions**: 800x400 pixels
- **Style**: Oscilloscope-style line graph
- **Color Scheme**: Dark background with green gradient waveform
- **Effects**: Glow effect and smooth gradients

## Architecture

The application uses a modular architecture with clear separation of concerns:

### AudioCapture (audioCapture.js)
- Handles microphone access via getUserMedia
- Manages MediaRecorder for audio capture
- Implements 15-second auto-stop timer
- Provides recorded audio as Blob
- Error handling for permission and device issues

### AudioAnalyzer (audioAnalyzer.js)
- Initializes Web Audio API context
- Creates and configures AnalyserNode
- Decodes audio blobs to extract waveform data
- Downsamples data for efficient visualization
- **Foundation for future spectrum analyzer**: Already configured for FFT analysis

### WaveformRenderer (waveformRenderer.js)
- Manages canvas drawing operations
- Renders waveform with gradient and glow effects
- Provides alternative envelope-style visualization
- Handles canvas clearing and initialization

### App (app.js)
- Main application controller
- Orchestrates all modules
- Manages UI state and user interactions
- Handles errors and user feedback
- Coordinates recording workflow

## Future Extensions: Spectrum Analyzer

This application is architected to support future spectrum analyzer functionality with minimal changes:

### Current Foundation
- AnalyserNode already configured with FFT size 2048
- `getFrequencyDataArray()` method ready in AudioAnalyzer
- Modular renderer design allows adding SpectrumRenderer

### Extension Path
1. Create `js/spectrumRenderer.js` for frequency visualization
2. Add second canvas in HTML for spectrum display
3. Use `audioAnalyzer.getFrequencyDataArray()` for frequency data
4. Implement vertical bars showing frequency spectrum
5. Add real-time visualization during recording

### No Refactoring Required
- Core audio pipeline remains unchanged
- Waveform and spectrum can display simultaneously
- Same AnalyserNode provides both time and frequency data

## Troubleshooting

### Microphone Access Denied
- Check browser permissions settings
- Ensure you're using HTTPS or localhost
- Try a different browser
- Restart browser and try again

### No Audio Recorded
- Check microphone is connected and working
- Test microphone in system settings
- Ensure microphone is not muted
- Check browser console for errors

### Blank Canvas
- Wait for recording to complete (15 seconds)
- Check browser console for JavaScript errors
- Try refreshing the page
- Ensure Canvas API is supported in your browser

### Browser Not Supported Error
- Update to latest browser version
- Try Chrome or Firefox (best support)
- Check JavaScript is enabled

## Development

### Local Testing
```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or use Node.js http-server
npx http-server

# Then open http://localhost:8000
```

### Customization

**Change Recording Duration**
```javascript
// In audioCapture.js
this.recordingDuration = 30000; // 30 seconds
```

**Change Canvas Size**
```html
<!-- In index.html -->
<canvas id="waveformCanvas" width="1000" height="500"></canvas>
```

**Change Waveform Color**
```javascript
// In waveformRenderer.js
this.waveformColor = '#3498db'; // Blue waveform
```

**Change FFT Size**
```javascript
// In audioAnalyzer.js
this.analyserNode.fftSize = 4096; // Higher resolution
```

## License

This project is open source and available for educational and personal use.

## Credits

Built with native browser APIs:
- Web Audio API
- MediaStream API
- MediaRecorder API
- Canvas API

No external libraries or frameworks used.

---

**Enjoy recording and visualizing your voice!**
