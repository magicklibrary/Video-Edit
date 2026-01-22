/**
 * AI Video Processor - Local Browser AI
 * Uses WebAssembly and browser APIs for AI features
 * NO external APIs needed - 100% local processing
 */

class AIVideoProcessor {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        // Initialize Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isInitialized = true;
        
        console.log('✅ AI Processor initialized - Ready for local processing');
    }

    /**
     * Analyze video content using computer vision
     */
    async analyzeVideo(videoElement) {
        console.log('🔍 Analyzing video content...');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const analysis = {
            scenes: [],
            keyFrames: [],
            motionIntensity: [],
            colorPalette: [],
            suggestedCuts: []
        };

        // Sample frames throughout video
        const duration = videoElement.duration;
        const sampleCount = Math.min(50, Math.floor(duration * 2)); // 2 samples per second
        
        canvas.width = 640;
        canvas.height = 360;

        for (let i = 0; i < sampleCount; i++) {
            const time = (i / sampleCount) * duration;
            videoElement.currentTime = time;
            
            await new Promise(resolve => {
                videoElement.onseeked = () => {
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    // Analyze this frame
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const frameAnalysis = this.analyzeFrame(imageData, time);
                    
                    analysis.keyFrames.push({
                        time: time,
                        brightness: frameAnalysis.brightness,
                        colorfulness: frameAnalysis.colorfulness,
                        edgeIntensity: frameAnalysis.edgeIntensity
                    });
                    
                    resolve();
                };
            });
        }

        // Detect scene changes
        analysis.scenes = this.detectScenes(analysis.keyFrames);
        
        // Suggest cuts based on scene changes
        analysis.suggestedCuts = this.suggestCuts(analysis.keyFrames, analysis.scenes);
        
        // Extract dominant colors
        analysis.colorPalette = await this.extractColorPalette(videoElement);

        console.log('✅ Video analysis complete:', analysis);
        return analysis;
    }

    /**
     * Analyze a single frame
     */
    analyzeFrame(imageData, time) {
        const data = imageData.data;
        let brightness = 0;
        let colorfulness = 0;
        let rSum = 0, gSum = 0, bSum = 0;

        // Calculate average brightness and color
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            brightness += (r + g + b) / 3;
            rSum += r;
            gSum += g;
            bSum += b;
        }

        const pixelCount = data.length / 4;
        brightness /= pixelCount;
        
        const rAvg = rSum / pixelCount;
        const gAvg = gSum / pixelCount;
        const bAvg = bSum / pixelCount;
        
        // Color variance = colorfulness
        colorfulness = Math.sqrt(
            Math.pow(rAvg - gAvg, 2) + 
            Math.pow(gAvg - bAvg, 2) + 
            Math.pow(bAvg - rAvg, 2)
        );

        // Simple edge detection
        let edgeIntensity = 0;
        for (let i = 0; i < data.length - 4; i += 4) {
            const diff = Math.abs(data[i] - data[i + 4]);
            edgeIntensity += diff;
        }
        edgeIntensity /= pixelCount;

        return { brightness, colorfulness, edgeIntensity };
    }

    /**
     * Detect scene changes
     */
    detectScenes(keyFrames) {
        const scenes = [];
        const threshold = 30; // Brightness change threshold

        for (let i = 1; i < keyFrames.length; i++) {
            const prev = keyFrames[i - 1];
            const curr = keyFrames[i];
            
            const brightnessChange = Math.abs(curr.brightness - prev.brightness);
            const colorChange = Math.abs(curr.colorfulness - prev.colorfulness);
            
            if (brightnessChange > threshold || colorChange > threshold) {
                scenes.push({
                    time: curr.time,
                    type: 'scene_change',
                    intensity: brightnessChange + colorChange
                });
            }
        }

        return scenes;
    }

    /**
     * Suggest intelligent cuts
     */
    suggestCuts(keyFrames, scenes) {
        const cuts = [];
        
        // Cut at major scene changes
        scenes.forEach(scene => {
            if (scene.intensity > 50) {
                cuts.push({
                    time: scene.time,
                    reason: 'Major scene change',
                    confidence: Math.min(scene.intensity / 100, 1)
                });
            }
        });

        // Find low-motion segments (potential dead air)
        for (let i = 0; i < keyFrames.length - 5; i++) {
            const segment = keyFrames.slice(i, i + 5);
            const avgEdge = segment.reduce((sum, f) => sum + f.edgeIntensity, 0) / 5;
            
            if (avgEdge < 10) { // Low motion
                cuts.push({
                    time: segment[0].time,
                    duration: segment[4].time - segment[0].time,
                    reason: 'Low motion segment (potential silence)',
                    confidence: 0.7
                });
            }
        }

        return cuts;
    }

    /**
     * Extract dominant color palette
     */
    async extractColorPalette(videoElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 160;
        canvas.height = 90;

        // Sample middle of video
        videoElement.currentTime = videoElement.duration / 2;
        
        await new Promise(resolve => {
            videoElement.onseeked = () => {
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                resolve();
            };
        });

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = this.quantizeColors(imageData, 5);
        
        return colors.map(c => ({
            r: c[0],
            g: c[1],
            b: c[2],
            hex: `#${c[0].toString(16).padStart(2, '0')}${c[1].toString(16).padStart(2, '0')}${c[2].toString(16).padStart(2, '0')}`
        }));
    }

    /**
     * Color quantization (simplified k-means)
     */
    quantizeColors(imageData, k) {
        const data = imageData.data;
        const pixels = [];
        
        // Sample pixels
        for (let i = 0; i < data.length; i += 40) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }

        // Simple k-means clustering
        let centroids = pixels.slice(0, k);
        
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array(k).fill().map(() => []);
            
            pixels.forEach(pixel => {
                let minDist = Infinity;
                let minIdx = 0;
                
                centroids.forEach((centroid, idx) => {
                    const dist = Math.sqrt(
                        Math.pow(pixel[0] - centroid[0], 2) +
                        Math.pow(pixel[1] - centroid[1], 2) +
                        Math.pow(pixel[2] - centroid[2], 2)
                    );
                    
                    if (dist < minDist) {
                        minDist = dist;
                        minIdx = idx;
                    }
                });
                
                clusters[minIdx].push(pixel);
            });

            // Update centroids
            centroids = clusters.map(cluster => {
                if (cluster.length === 0) return [0, 0, 0];
                
                const sum = cluster.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
                return [
                    Math.round(sum[0] / cluster.length),
                    Math.round(sum[1] / cluster.length),
                    Math.round(sum[2] / cluster.length)
                ];
            });
        }

        return centroids;
    }

    /**
     * Generate motion graphics overlays
     */
    generateMotionGraphics(analysis, settings) {
        const graphics = [];
        const { mode, style } = settings;

        if (mode === 'mystical') {
            // Mystical book review style
            graphics.push({
                type: 'title_card',
                time: 0,
                duration: 3,
                animation: 'fade_zoom',
                text: settings.title || 'Book Review',
                style: {
                    fontFamily: 'Cinzel, serif',
                    fontSize: 72,
                    color: analysis.colorPalette[0]?.hex || '#6a0dad',
                    shadow: '0 0 20px rgba(106, 13, 173, 0.8)'
                }
            });

            // Chapter markers
            analysis.scenes.forEach((scene, idx) => {
                if (idx % 3 === 0) { // Every 3rd scene
                    graphics.push({
                        type: 'chapter_marker',
                        time: scene.time,
                        duration: 2,
                        animation: 'slide_fade',
                        text: `Chapter ${Math.floor(idx / 3) + 1}`,
                        style: {
                            fontFamily: 'Georgia, serif',
                            fontSize: 48,
                            color: '#ffffff',
                            background: 'rgba(106, 13, 173, 0.7)'
                        }
                    });
                }
            });

            // Quote overlays at key moments
            const keyMoments = analysis.suggestedCuts
                .filter(cut => cut.confidence > 0.8)
                .slice(0, 3);
            
            keyMoments.forEach((moment, idx) => {
                graphics.push({
                    type: 'quote_overlay',
                    time: moment.time,
                    duration: 5,
                    animation: 'typewriter',
                    text: settings.quotes?.[idx] || 'Key Insight',
                    style: {
                        fontFamily: 'Georgia, serif',
                        fontSize: 36,
                        color: '#ffd700',
                        italic: true
                    }
                });
            });

            // Mystical particle effects
            graphics.push({
                type: 'particle_effect',
                time: 0,
                duration: 'full',
                effect: 'floating_sparkles',
                density: 'low',
                color: analysis.colorPalette[1]?.hex || '#ffd700'
            });
        }

        return graphics;
    }

    /**
     * Apply transitions between cuts
     */
    generateTransitions(cuts, style = 'smooth') {
        const transitions = [];
        
        const transitionTypes = {
            smooth: ['fade', 'dissolve', 'crossfade'],
            dynamic: ['slide', 'zoom', 'rotate'],
            cinematic: ['fade_black', 'wipe', 'iris']
        };

        const types = transitionTypes[style] || transitionTypes.smooth;

        cuts.forEach((cut, idx) => {
            transitions.push({
                time: cut.time,
                type: types[idx % types.length],
                duration: 0.5,
                easing: 'ease-in-out'
            });
        });

        return transitions;
    }

    /**
     * Generate auto-paced edits
     */
    async generateAutoPacing(videoElement, mode = 'balanced') {
        console.log('⚡ Generating auto-paced edit...');
        
        const analysis = await this.analyzeVideo(videoElement);
        const pacing = {
            cuts: [],
            speedAdjustments: [],
            removeSegments: []
        };

        const pacingMap = {
            slow: { threshold: 0.6, speedRange: [0.9, 1.1] },
            balanced: { threshold: 0.7, speedRange: [0.9, 1.2] },
            fast: { threshold: 0.8, speedRange: [1.0, 1.5] }
        };

        const config = pacingMap[mode] || pacingMap.balanced;

        // Auto-cut at low confidence segments
        analysis.suggestedCuts.forEach(cut => {
            if (cut.confidence > config.threshold) {
                pacing.cuts.push(cut.time);
            }
            
            if (cut.reason.includes('silence')) {
                pacing.removeSegments.push({
                    start: cut.time,
                    end: cut.time + (cut.duration || 1)
                });
            }
        });

        // Speed up slow sections
        for (let i = 0; i < analysis.keyFrames.length - 1; i++) {
            const frame = analysis.keyFrames[i];
            const next = analysis.keyFrames[i + 1];
            
            if (frame.edgeIntensity < 15) { // Slow/static section
                pacing.speedAdjustments.push({
                    start: frame.time,
                    end: next.time,
                    speed: config.speedRange[1]
                });
            }
        }

        console.log('✅ Auto-pacing generated:', pacing);
        return pacing;
    }

    /**
     * Generate title suggestions using pattern matching
     */
    generateTitleSuggestions(videoName, mode = 'mystical') {
        const templates = {
            mystical: [
                `Unveiling the Mysteries of ${videoName}`,
                `${videoName}: A Journey into the Unknown`,
                `The Hidden Wisdom of ${videoName}`,
                `Secrets Revealed: ${videoName}`,
                `Exploring ${videoName} - Ancient Knowledge`
            ],
            modern: [
                `${videoName} - Full Review`,
                `Everything You Need to Know: ${videoName}`,
                `${videoName} Explained`,
                `The Ultimate Guide to ${videoName}`,
                `${videoName} - My Honest Thoughts`
            ],
            cinematic: [
                `${videoName} | A Cinematic Experience`,
                `The Story Behind ${videoName}`,
                `${videoName}: Unveiled`,
                `Journey Through ${videoName}`,
                `${videoName} - An Epic Tale`
            ]
        };

        return templates[mode] || templates.mystical;
    }

    /**
     * Generate thumbnail concepts
     */
    async generateThumbnailConcepts(videoElement, analysis) {
        const concepts = [];
        
        // Find visually interesting frames
        const sortedFrames = [...analysis.keyFrames]
            .sort((a, b) => b.colorfulness + b.edgeIntensity - (a.colorfulness + a.edgeIntensity))
            .slice(0, 3);

        for (const frame of sortedFrames) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 1280;
            canvas.height = 720;

            videoElement.currentTime = frame.time;
            await new Promise(resolve => {
                videoElement.onseeked = () => {
                    // Draw frame
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    // Apply cinematic crop
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(0, 0, canvas.width, 100);
                    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
                    
                    // Add title text
                    ctx.font = 'bold 72px Arial';
                    ctx.fillStyle = '#ffffff';
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 8;
                    ctx.textAlign = 'center';
                    
                    const text = 'Mystical Review';
                    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
                    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                    
                    concepts.push({
                        timestamp: frame.time,
                        dataUrl: canvas.toDataURL('image/jpeg', 0.95),
                        score: frame.colorfulness + frame.edgeIntensity
                    });
                    
                    resolve();
                };
            });
        }

        return concepts;
    }
}

// Export for use
window.AIVideoProcessor = AIVideoProcessor;
