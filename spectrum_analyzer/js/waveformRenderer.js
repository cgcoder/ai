class WaveformRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.width = canvasElement.width;
        this.height = canvasElement.height;
        this.centerY = this.height / 2;

        // Visual settings
        this.backgroundColor = '#1a1a2e';
        this.waveformColor = '#16c172';
        this.centerLineColor = '#333';
        this.lineWidth = 2;

        // Initialize with empty canvas
        this.initialize();
    }

    /**
     * Initialize the canvas with background and center line
     */
    initialize() {
        // Set canvas background
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw center line
        this.drawCenterLine();

        // Draw placeholder text
        this.drawPlaceholderText();
    }

    /**
     * Draw the center reference line
     */
    drawCenterLine() {
        this.ctx.strokeStyle = this.centerLineColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.stroke();
    }

    /**
     * Draw placeholder text when no waveform is available
     */
    drawPlaceholderText() {
        this.ctx.fillStyle = '#444';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Waveform will appear here after recording', this.width / 2, this.centerY);
    }

    /**
     * Draw waveform from audio data
     * @param {Float32Array} waveformData - Audio waveform data (normalized to -1 to 1)
     */
    drawWaveform(waveformData) {
        // Clear canvas
        this.clear();

        // Draw center line
        this.drawCenterLine();

        if (!waveformData || waveformData.length === 0) {
            this.drawPlaceholderText();
            return;
        }

        // Calculate how many samples we can show (match canvas width)
        const samplesToShow = Math.min(waveformData.length, this.width * 2);

        // Calculate step size for x-axis
        const stepX = this.width / samplesToShow;

        // Set up drawing style
        this.ctx.strokeStyle = this.waveformColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Create gradient for waveform
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#16c172');
        gradient.addColorStop(0.5, '#0ea85e');
        gradient.addColorStop(1, '#16c172');
        this.ctx.strokeStyle = gradient;

        // Begin drawing the waveform
        this.ctx.beginPath();

        // Sample interval to match display width
        const sampleInterval = Math.floor(waveformData.length / samplesToShow);

        let firstPoint = true;

        for (let i = 0; i < samplesToShow; i++) {
            // Get sample index
            const sampleIndex = Math.min(Math.floor(i * sampleInterval), waveformData.length - 1);

            // Get sample value (-1 to 1)
            const sample = waveformData[sampleIndex];

            // Calculate x and y positions
            const x = i * stepX;
            const y = this.centerY + (sample * (this.height / 2) * 0.9); // 0.9 for padding

            // Draw line
            if (firstPoint) {
                this.ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        // Render the path
        this.ctx.stroke();

        // Add glow effect
        this.addGlowEffect(waveformData, samplesToShow, stepX, sampleInterval);
    }

    /**
     * Add a subtle glow effect to the waveform
     * @param {Float32Array} waveformData - Audio waveform data
     * @param {number} samplesToShow - Number of samples to display
     * @param {number} stepX - X-axis step size
     * @param {number} sampleInterval - Sampling interval
     */
    addGlowEffect(waveformData, samplesToShow, stepX, sampleInterval) {
        // Save context state
        this.ctx.save();

        // Set up glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.waveformColor;
        this.ctx.strokeStyle = this.waveformColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.globalAlpha = 0.5;

        // Draw the same path again with glow
        this.ctx.beginPath();

        let firstPoint = true;

        for (let i = 0; i < samplesToShow; i++) {
            const sampleIndex = Math.min(Math.floor(i * sampleInterval), waveformData.length - 1);
            const sample = waveformData[sampleIndex];
            const x = i * stepX;
            const y = this.centerY + (sample * (this.height / 2) * 0.9);

            if (firstPoint) {
                this.ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();

        // Restore context state
        this.ctx.restore();
    }

    /**
     * Draw a simplified waveform (envelope style)
     * Alternative visualization showing amplitude envelope
     * @param {Float32Array} waveformData - Audio waveform data
     */
    drawEnvelope(waveformData) {
        this.clear();
        this.drawCenterLine();

        if (!waveformData || waveformData.length === 0) {
            this.drawPlaceholderText();
            return;
        }

        const barCount = 200; // Number of bars to show
        const barWidth = this.width / barCount;
        const samplesPerBar = Math.floor(waveformData.length / barCount);

        this.ctx.fillStyle = this.waveformColor;

        for (let i = 0; i < barCount; i++) {
            // Calculate max amplitude in this segment
            let max = 0;
            for (let j = 0; j < samplesPerBar; j++) {
                const index = i * samplesPerBar + j;
                if (index < waveformData.length) {
                    max = Math.max(max, Math.abs(waveformData[index]));
                }
            }

            // Draw bar
            const barHeight = max * (this.height / 2) * 0.9;
            const x = i * barWidth;
            const y = this.centerY - barHeight;

            this.ctx.fillRect(x, y, barWidth - 1, barHeight * 2);
        }
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Resize canvas (useful for responsive design)
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.centerY = height / 2;

        this.initialize();
    }

    /**
     * Get canvas element
     * @returns {HTMLCanvasElement} The canvas element
     */
    getCanvas() {
        return this.canvas;
    }
}
