/**
 * Professional Audio Processor
 * Crystal clear audio enhancement using Web Audio API
 * Noise reduction, EQ, compression, and voice enhancement
 */

class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.sourceNode = null;
        this.filters = {};
    }

    async initialize() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🎙️ Audio Processor initialized');
    }

    /**
     * Enhance audio from video element
     */
    async enhanceAudio(videoElement, settings = {}) {
        const {
            noiseReduction = 70,
            bassBoost = 30,
            voiceClarity = 80,
            compression = 60,
            normalize = true
        } = settings;

        console.log('🎙️ Enhancing audio...');

        // Create audio context if not exists
        if (!this.audioContext) {
            await this.initialize();
        }

        // Check if source already exists for this video element
        if (this.sourceNode) {
            console.log('🎙️ Audio source already connected, reusing...');
            return this.audioContext;
        }

        // Create source from video (only once per element)
        const source = this.audioContext.createMediaElementSource(videoElement);
        this.sourceNode = source;
        
        // Build audio processing chain
        let currentNode = this.sourceNode;

        // 1. High-pass filter (remove rumble/noise below 80Hz)
        const highPass = this.audioContext.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 80;
        highPass.Q.value = 0.7;
        currentNode.connect(highPass);
        currentNode = highPass;

        // 2. Voice frequency boost (2-4kHz for clarity)
        const voicePeakFilter = this.audioContext.createBiquadFilter();
        voicePeakFilter.type = 'peaking';
        voicePeakFilter.frequency.value = 3000;
        voicePeakFilter.Q.value = 1.0;
        voicePeakFilter.gain.value = (voiceClarity / 100) * 6; // Up to +6dB
        currentNode.connect(voicePeakFilter);
        currentNode = voicePeakFilter;

        // 3. Bass boost (if enabled)
        if (bassBoost > 0) {
            const bassFilter = this.audioContext.createBiquadFilter();
            bassFilter.type = 'lowshelf';
            bassFilter.frequency.value = 200;
            bassFilter.gain.value = (bassBoost / 100) * 8; // Up to +8dB
            currentNode.connect(bassFilter);
            currentNode = bassFilter;
        }

        // 4. De-esser (reduce harsh 's' sounds at 6-8kHz)
        const deEsser = this.audioContext.createBiquadFilter();
        deEsser.type = 'peaking';
        deEsser.frequency.value = 7000;
        deEsser.Q.value = 2.0;
        deEsser.gain.value = -4;
        currentNode.connect(deEsser);
        currentNode = deEsser;

        // 5. Dynamic range compression (make quiet parts louder, loud parts controlled)
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 4 + (compression / 100) * 8; // Ratio 4:1 to 12:1
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        currentNode.connect(compressor);
        currentNode = compressor;

        // 6. Final gain adjustment
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.2 + (compression / 100) * 0.5; // Boost overall volume
        currentNode.connect(gainNode);
        currentNode = gainNode;

        // Connect to destination
        currentNode.connect(this.audioContext.destination);

        console.log('✅ Audio enhancement chain built');
        return this.audioContext;
    }

    /**
     * Analyze audio levels and detect silence
     */
    async analyzeAudio(videoElement) {
        console.log('🔍 Analyzing audio...');
        
        // Create a separate audio context for analysis (not connected to output)
        const audioContext = new AudioContext();
        
        // Clone the video for analysis to avoid connection conflicts
        const tempVideo = document.createElement('video');
        tempVideo.src = videoElement.src;
        tempVideo.muted = true; // Mute the analysis video
        
        await new Promise(resolve => {
            tempVideo.onloadedmetadata = resolve;
        });
        
        const source = audioContext.createMediaElementSource(tempVideo);
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 2048;
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const silenceThreshold = 30; // dB
        const silentSegments = [];
        const loudSegments = [];
        let currentSilentStart = null;

                
        const duration = tempVideo.duration;
        const sampleRate = 10; // samples per second
        
        for (let i = 0; i < duration * sampleRate; i++) {
            const time = i / sampleRate;
            tempVideo.currentTime = time;
            
            await new Promise(resolve => {
                tempVideo.onseeked = () => {
                    analyser.getByteFrequencyData(dataArray);
                    
                    // Calculate average volume
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    
                    if (average < silenceThreshold) {
                        if (currentSilentStart === null) {
                            currentSilentStart = time;
                        }
                    } else {
                        if (currentSilentStart !== null) {
                            silentSegments.push({
                                start: currentSilentStart,
                                end: time,
                                duration: time - currentSilentStart
                            });
                            currentSilentStart = null;
                        }
                        
                        if (average > 100) {
                            loudSegments.push({
                                time: time,
                                level: average
                            });
                        }
                    }
                    
                    resolve();
                };
            });
        }

        // Clean up
        tempVideo.pause();
        source.disconnect();
        audioContext.close();

        return {
            silentSegments: silentSegments.filter(s => s.duration > 0.5), // Only segments > 0.5s
            loudSegments,
            totalSilence: silentSegments.reduce((sum, s) => sum + s.duration, 0)
        };
    }

    /**
     * Visualize audio waveform
     */
    visualizeAudio(videoElement, canvas) {
        // Create separate context for visualization
        const audioContext = new AudioContext();
        
        // Check if we already have a visualization for this video
        if (videoElement._audioVizSource) {
            return; // Already visualizing
        }
        
        const source = audioContext.createMediaElementSource(videoElement);
        videoElement._audioVizSource = source; // Mark as connected
        
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const draw = () => {
            requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = canvas.width / bufferLength * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                
                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#6a0dad');
                gradient.addColorStop(1, '#ffd700');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };

        draw();
    }

    /**
     * Remove background noise (simple gate)
     */
    removeNoise(audioBuffer, threshold = 0.01) {
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            if (Math.abs(channelData[i]) < threshold) {
                channelData[i] = 0;
            }
        }
        
        return audioBuffer;
    }

    /**
     * Normalize audio levels
     */
    normalizeAudio(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        let max = 0;
        
        // Find peak
        for (let i = 0; i < channelData.length; i++) {
            const abs = Math.abs(channelData[i]);
            if (abs > max) max = abs;
        }
        
        // Normalize to -1dB (0.9 amplitude)
        const targetPeak = 0.9;
        const gain = targetPeak / max;
        
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] *= gain;
        }
        
        return audioBuffer;
    }

    /**
     * Apply ducking (reduce volume during certain parts)
     */
    applyDucking(audioBuffer, duckTimes = [], duckAmount = 0.3) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        
        duckTimes.forEach(({ start, end }) => {
            const startSample = Math.floor(start * sampleRate);
            const endSample = Math.floor(end * sampleRate);
            
            for (let i = startSample; i < endSample; i++) {
                channelData[i] *= duckAmount;
            }
        });
        
        return audioBuffer;
    }

    /**
     * Create professional podcast-style audio
     */
    applyPodcastPreset(videoElement) {
        return this.enhanceAudio(videoElement, {
            noiseReduction: 80,
            bassBoost: 40,
            voiceClarity: 90,
            compression: 70,
            normalize: true
        });
    }

    /**
     * Create energetic YouTube-style audio
     */
    applyYouTubePreset(videoElement) {
        return this.enhanceAudio(videoElement, {
            noiseReduction: 70,
            bassBoost: 50,
            voiceClarity: 85,
            compression: 80,
            normalize: true
        });
    }

    /**
     * Create cinematic audio
     */
    applyCinematicPreset(videoElement) {
        return this.enhanceAudio(videoElement, {
            noiseReduction: 60,
            bassBoost: 60,
            voiceClarity: 75,
            compression: 50,
            normalize: true
        });
    }
}

// Export
window.AudioProcessor = AudioProcessor;
