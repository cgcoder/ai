class App {
    constructor() {
        // Initialize modules
        this.audioCapture = new AudioCapture();
        this.audioAnalyzer = new AudioAnalyzer();
        this.waveformRenderer = null;

        // UI Elements
        this.startBtn = null;
        this.playBtn = null;
        this.timerDisplay = null;
        this.statusDisplay = null;
        this.canvas = null;

        // State
        this.isRecording = false;
        this.hasRecording = false;
        this.audioElement = null;

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Get UI elements
            this.startBtn = document.getElementById('startBtn');
            this.playBtn = document.getElementById('playBtn');
            this.timerDisplay = document.getElementById('timer');
            this.statusDisplay = document.getElementById('status');
            this.canvas = document.getElementById('waveformCanvas');

            // Initialize waveform renderer
            this.waveformRenderer = new WaveformRenderer(this.canvas);

            // Initialize audio analyzer
            this.audioAnalyzer.initialize();

            // Set up event listeners
            this.setupEventListeners();

            // Update initial status
            this.updateStatus('Ready to record. Click "Start Recording" to begin.', 'normal');

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.handleStartRecording());
        this.playBtn.addEventListener('click', () => this.handlePlayRecording());
    }

    /**
     * Handle start recording button click
     */
    async handleStartRecording() {
        try {
            // Disable start button
            this.startBtn.disabled = true;
            this.updateStatus('Requesting microphone access...', 'normal');

            // Resume audio context (required by some browsers)
            await this.audioAnalyzer.resumeContext();

            // Request microphone access
            await this.audioCapture.requestMicrophoneAccess();

            // Start recording
            this.isRecording = true;
            this.startBtn.classList.add('recording');
            this.timerDisplay.classList.add('recording');
            this.updateStatus('Recording in progress...', 'normal');

            // Start recording with callbacks
            this.audioCapture.startRecording(
                (remainingSeconds) => this.handleTimerUpdate(remainingSeconds),
                (audioBlob) => this.handleRecordingComplete(audioBlob)
            );

        } catch (error) {
            this.handleError(error);
            this.resetRecordingState();
        }
    }

    /**
     * Handle timer updates during recording
     * @param {number} remainingSeconds - Seconds remaining in recording
     */
    handleTimerUpdate(remainingSeconds) {
        if (remainingSeconds > 0) {
            this.timerDisplay.textContent = `${remainingSeconds}s`;
        } else {
            this.timerDisplay.textContent = 'Processing...';
        }
    }

    /**
     * Handle recording completion
     * @param {Blob} audioBlob - The recorded audio blob
     */
    async handleRecordingComplete(audioBlob) {
        try {
            this.updateStatus('Analyzing audio and generating waveform...', 'normal');

            // Analyze the audio blob and get waveform data
            const waveformData = await this.audioAnalyzer.analyzeAudioBlob(audioBlob);

            // Downsample for visualization (reduce data points for smoother rendering)
            const downsampledData = this.audioAnalyzer.downsampleWaveform(waveformData, 1600);

            // Draw the waveform
            this.waveformRenderer.drawWaveform(downsampledData);

            // Mark that we have a recording
            this.hasRecording = true;

            // Enable play button
            this.playBtn.disabled = false;

            // Update status
            this.updateStatus('Recording complete! Click "Play Recording" to listen.', 'success');
            this.timerDisplay.textContent = 'Complete';
            this.timerDisplay.classList.remove('recording');

            // Reset recording state
            this.resetRecordingState();

        } catch (error) {
            this.handleError(error);
            this.resetRecordingState();
        }
    }

    /**
     * Handle play recording button click
     */
    handlePlayRecording() {
        try {
            if (!this.hasRecording) {
                return;
            }

            // Stop any currently playing audio
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
            }

            // Create audio element from recorded blob
            this.audioElement = this.audioCapture.createAudioElement();

            // Set up event listeners
            this.audioElement.addEventListener('play', () => {
                this.updateStatus('Playing recording...', 'normal');
                this.playBtn.disabled = true;
            });

            this.audioElement.addEventListener('ended', () => {
                this.updateStatus('Playback complete. Click "Play Recording" to listen again.', 'success');
                this.playBtn.disabled = false;
            });

            this.audioElement.addEventListener('error', (error) => {
                this.handleError(new Error('Failed to play recording'));
                this.playBtn.disabled = false;
            });

            // Play the audio
            this.audioElement.play();

        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Reset recording state
     */
    resetRecordingState() {
        this.isRecording = false;
        this.startBtn.disabled = false;
        this.startBtn.classList.remove('recording');
        this.startBtn.innerHTML = '<span class="btn-icon">🎤</span> Start New Recording';
    }

    /**
     * Update status display
     * @param {string} message - Status message to display
     * @param {string} type - Status type: 'normal', 'error', 'success'
     */
    updateStatus(message, type = 'normal') {
        this.statusDisplay.textContent = message;

        // Remove all status classes
        this.statusDisplay.classList.remove('error', 'success');

        // Add appropriate class
        if (type === 'error') {
            this.statusDisplay.classList.add('error');
        } else if (type === 'success') {
            this.statusDisplay.classList.add('success');
        }
    }

    /**
     * Handle errors
     * @param {Error} error - The error object
     */
    handleError(error) {
        console.error('Application error:', error);

        let errorMessage = 'An error occurred. Please try again.';

        if (error.message) {
            errorMessage = error.message;
        }

        this.updateStatus(errorMessage, 'error');
        this.timerDisplay.textContent = 'Error';
        this.timerDisplay.classList.remove('recording');
    }

    /**
     * Clean up resources when app is closed
     */
    cleanup() {
        // Stop any playing audio
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }

        // Clean up audio capture
        this.audioCapture.cleanup();

        // Clean up audio analyzer
        this.audioAnalyzer.cleanup();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();

    // Clean up when page is closed
    window.addEventListener('beforeunload', () => {
        app.cleanup();
    });
});
