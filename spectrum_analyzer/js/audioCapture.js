class AudioCapture {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordingDuration = 15000; // 15 seconds in milliseconds
        this.recordedBlob = null;
        this.recordingTimer = null;
        this.onTimerUpdate = null; // Callback for timer updates
        this.onRecordingComplete = null; // Callback when recording completes
    }

    /**
     * Request microphone access from the user
     * @returns {Promise<MediaStream>} The media stream from the microphone
     */
    async requestMicrophoneAccess() {
        try {
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }

            // Request audio input
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            return this.mediaStream;
        } catch (error) {
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('Microphone access denied. Please grant permission to use the microphone.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No microphone found. Please connect a microphone and try again.');
            } else {
                throw new Error(`Failed to access microphone: ${error.message}`);
            }
        }
    }

    /**
     * Start recording audio from the microphone
     * @param {Function} onTimerUpdate - Callback function called every second with remaining time
     * @param {Function} onRecordingComplete - Callback function called when recording completes
     */
    startRecording(onTimerUpdate, onRecordingComplete) {
        if (!this.mediaStream) {
            throw new Error('Microphone not initialized. Call requestMicrophoneAccess() first.');
        }

        // Store callbacks
        this.onTimerUpdate = onTimerUpdate;
        this.onRecordingComplete = onRecordingComplete;

        // Reset audio chunks
        this.audioChunks = [];

        // Determine supported MIME type
        const mimeType = this.getSupportedMimeType();

        // Create MediaRecorder
        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000
        });

        // Handle data available event
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        });

        // Handle recording stop event
        this.mediaRecorder.addEventListener('stop', () => {
            this.createAudioBlob();
        });

        // Start recording
        this.mediaRecorder.start();

        // Start countdown timer
        this.startTimer();
    }

    /**
     * Get supported MIME type for MediaRecorder
     * @returns {string} Supported MIME type
     */
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/mp4'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }

        return ''; // Let browser choose default
    }

    /**
     * Start the 15-second countdown timer
     */
    startTimer() {
        let remainingSeconds = 15;

        // Update immediately
        if (this.onTimerUpdate) {
            this.onTimerUpdate(remainingSeconds);
        }

        // Update every second
        this.recordingTimer = setInterval(() => {
            remainingSeconds--;

            if (this.onTimerUpdate) {
                this.onTimerUpdate(remainingSeconds);
            }

            if (remainingSeconds <= 0) {
                this.stopRecording();
            }
        }, 1000);
    }

    /**
     * Stop recording audio
     */
    stopRecording() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
    }

    /**
     * Create audio blob from recorded chunks
     */
    createAudioBlob() {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        this.recordedBlob = new Blob(this.audioChunks, { type: mimeType });

        // Call completion callback
        if (this.onRecordingComplete) {
            this.onRecordingComplete(this.recordedBlob);
        }
    }

    /**
     * Get the recorded audio blob
     * @returns {Blob} The recorded audio blob
     */
    getRecordedBlob() {
        return this.recordedBlob;
    }

    /**
     * Create an audio element for playback
     * @returns {HTMLAudioElement} Audio element with the recorded audio
     */
    createAudioElement() {
        if (!this.recordedBlob) {
            throw new Error('No recording available');
        }

        const audio = new Audio();
        audio.src = URL.createObjectURL(this.recordedBlob);
        return audio;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Stop any ongoing recording
        this.stopRecording();

        // Stop media stream tracks
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        // Clear audio chunks
        this.audioChunks = [];
    }
}
