class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyserNode = null;
        this.sourceNode = null;
        this.dataArray = null;
        this.bufferLength = null;
    }

    /**
     * Initialize the Web Audio API context and analyser node
     */
    initialize() {
        try {
            // Create AudioContext (with vendor prefix fallback)
            const AudioContext = window.AudioContext || window.webkitAudioContext;

            if (!AudioContext) {
                throw new Error('Web Audio API is not supported in this browser');
            }

            this.audioContext = new AudioContext();

            // Create AnalyserNode for audio analysis
            this.analyserNode = this.audioContext.createAnalyser();

            // Configure analyser for optimal waveform and spectrum analysis
            this.analyserNode.fftSize = 2048; // Power of 2, good for both time and frequency domain
            this.analyserNode.smoothingTimeConstant = 0.8; // Smooth visualization
            this.analyserNode.minDecibels = -90;
            this.analyserNode.maxDecibels = -10;

            // Calculate buffer length (half of FFT size for frequency data)
            this.bufferLength = this.analyserNode.frequencyBinCount;

            // Create data array for storing analysis data
            this.dataArray = new Uint8Array(this.bufferLength);

            return true;
        } catch (error) {
            throw new Error(`Failed to initialize audio analyzer: ${error.message}`);
        }
    }

    /**
     * Resume AudioContext if it's in suspended state
     * (Some browsers require user interaction before starting AudioContext)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Analyze an audio blob and extract waveform data
     * @param {Blob} audioBlob - The recorded audio blob
     * @returns {Promise<Float32Array>} Waveform data normalized to -1 to 1 range
     */
    async analyzeAudioBlob(audioBlob) {
        try {
            // Convert blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();

            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            // Extract waveform data from the first channel
            const waveformData = audioBuffer.getChannelData(0);

            return waveformData;
        } catch (error) {
            throw new Error(`Failed to analyze audio: ${error.message}`);
        }
    }

    /**
     * Get time-domain (waveform) data from analyser
     * Used for real-time visualization if needed
     * @returns {Uint8Array} Time domain data (0-255 range)
     */
    getTimeDataArray() {
        if (!this.analyserNode) {
            throw new Error('Analyzer not initialized');
        }

        this.analyserNode.getByteTimeDomainData(this.dataArray);
        return this.dataArray;
    }

    /**
     * Get frequency-domain data from analyser
     * This will be useful for future spectrum analyzer implementation
     * @returns {Uint8Array} Frequency data (0-255 range)
     */
    getFrequencyDataArray() {
        if (!this.analyserNode) {
            throw new Error('Analyzer not initialized');
        }

        this.analyserNode.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    /**
     * Connect a media stream to the analyser for real-time analysis
     * @param {MediaStream} stream - The media stream to analyze
     */
    connectStream(stream) {
        if (!this.audioContext || !this.analyserNode) {
            throw new Error('Analyzer not initialized');
        }

        // Create media stream source
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);

        // Connect to analyser
        this.sourceNode.connect(this.analyserNode);

        // Note: We don't connect to destination to avoid feedback
    }

    /**
     * Disconnect the current source from the analyser
     */
    disconnectSource() {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
    }

    /**
     * Downsample waveform data for visualization
     * This reduces the amount of data to draw on canvas
     * @param {Float32Array} data - Original waveform data
     * @param {number} targetSamples - Number of samples to reduce to
     * @returns {Float32Array} Downsampled data
     */
    downsampleWaveform(data, targetSamples) {
        const blockSize = Math.floor(data.length / targetSamples);
        const downsampledData = new Float32Array(targetSamples);

        for (let i = 0; i < targetSamples; i++) {
            const start = i * blockSize;
            const end = start + blockSize;

            // Calculate average (or max) for this block
            let sum = 0;
            for (let j = start; j < end && j < data.length; j++) {
                sum += Math.abs(data[j]);
            }

            // Use the average with sign from middle sample
            const middleIndex = Math.floor((start + end) / 2);
            const sign = data[middleIndex] >= 0 ? 1 : -1;
            downsampledData[i] = sign * (sum / blockSize);
        }

        return downsampledData;
    }

    /**
     * Get analyser node for direct access
     * @returns {AnalyserNode} The analyser node
     */
    getAnalyserNode() {
        return this.analyserNode;
    }

    /**
     * Get audio context
     * @returns {AudioContext} The audio context
     */
    getAudioContext() {
        return this.audioContext;
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.disconnectSource();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyserNode = null;
        this.dataArray = null;
    }
}
