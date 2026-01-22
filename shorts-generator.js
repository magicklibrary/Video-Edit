/**
 * Viral Shorts Generator
 * Automatically creates engaging short-form content from long videos
 * Optimized for TikTok, Instagram Reels, and YouTube Shorts
 */

class ShortsGenerator {
    constructor() {
        this.videoElement = null;
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Analyze video and find best moments for shorts
     */
    async findBestMoments(videoElement, count = 3, duration = 60) {
        console.log('🔍 Finding best moments for shorts...');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 180;

        const moments = [];
        const sampleRate = 5; // samples per second
        const totalSamples = Math.floor(videoElement.duration * sampleRate);

        for (let i = 0; i < totalSamples; i++) {
            const time = i / sampleRate;
            videoElement.currentTime = time;

            await new Promise(resolve => {
                videoElement.onseeked = () => {
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Calculate interest score
                    const score = this.calculateInterestScore(imageData);
                    
                    moments.push({
                        time,
                        score,
                        brightness: this.calculateBrightness(imageData),
                        motion: 0 // Will calculate from frame differences
                    });
                    
                    resolve();
                };
            });
        }

        // Calculate motion between frames
        for (let i = 1; i < moments.length; i++) {
            moments[i].motion = Math.abs(moments[i].score - moments[i - 1].score);
        }

        // Find peaks (high interest + motion)
        const peaks = moments
            .map((m, idx) => ({ ...m, index: idx }))
            .filter(m => m.score > 50 || m.motion > 20)
            .sort((a, b) => (b.score + b.motion) - (a.score + a.motion))
            .slice(0, count * 3); // Get more candidates

        // Select non-overlapping segments
        const selectedSegments = [];
        const minGap = duration + 5; // Minimum gap between clips

        for (const peak of peaks) {
            const startTime = Math.max(0, peak.time - duration / 2);
            const endTime = Math.min(videoElement.duration, peak.time + duration / 2);
            
            // Check if overlaps with existing
            const overlaps = selectedSegments.some(seg => 
                (startTime >= seg.start && startTime <= seg.end) ||
                (endTime >= seg.start && endTime <= seg.end)
            );

            if (!overlaps) {
                selectedSegments.push({
                    start: startTime,
                    end: endTime,
                    peakTime: peak.time,
                    score: peak.score + peak.motion
                });

                if (selectedSegments.length >= count) break;
            }
        }

        return selectedSegments.sort((a, b) => a.start - b.start);
    }

    /**
     * Calculate visual interest score
     */
    calculateInterestScore(imageData) {
        const data = imageData.data;
        let colorVariance = 0;
        let edgeCount = 0;
        
        // Calculate color variance (more interesting = more colorful)
        for (let i = 0; i < data.length; i += 40) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
        }

        // Simple edge detection
        for (let i = 0; i < data.length - 4; i += 4) {
            const diff = Math.abs(data[i] - data[i + 4]);
            if (diff > 30) edgeCount++;
        }

        return (colorVariance / 1000) + (edgeCount / 10);
    }

    calculateBrightness(imageData) {
        const data = imageData.data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        return sum / (data.length / 4);
    }

    /**
     * Generate a single short video
     */
    async generateShort(videoElement, segment, settings = {}) {
        console.log(`🎬 Generating short: ${segment.start}s - ${segment.end}s`);

        const {
            addCaptions = true,
            autoCrop = true,
            addEffects = true,
            addMusic = false,
            style = 'energetic'
        } = settings;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Vertical format (9:16 for mobile)
        canvas.width = 1080;
        canvas.height = 1920;

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        return new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                resolve(blob);
            };

            videoElement.currentTime = segment.start;
            mediaRecorder.start();

            let frameCount = 0;
            const fps = 30;
            const totalFrames = (segment.end - segment.start) * fps;

            const renderFrame = () => {
                if (videoElement.currentTime >= segment.end) {
                    mediaRecorder.stop();
                    return;
                }

                ctx.save();
                
                // Clear background
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate crop area (center or face-detected)
                const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
                const targetAspect = 9 / 16;

                let sx, sy, sw, sh;
                
                if (autoCrop && videoAspect > targetAspect) {
                    // Video is wider, crop horizontally (center on subject)
                    sw = videoElement.videoHeight * targetAspect;
                    sh = videoElement.videoHeight;
                    sx = (videoElement.videoWidth - sw) / 2; // Center crop
                    sy = 0;
                } else {
                    // Video is taller or same, crop vertically
                    sw = videoElement.videoWidth;
                    sh = videoElement.videoWidth / targetAspect;
                    sx = 0;
                    sy = Math.max(0, (videoElement.videoHeight - sh) / 3); // Upper third crop
                }

                // Draw cropped video
                ctx.drawImage(videoElement, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

                // Apply viral effects
                if (addEffects) {
                    this.applyViralEffects(ctx, canvas, frameCount, style);
                }

                // Add captions
                if (addCaptions) {
                    this.addViralCaptions(ctx, canvas, videoElement.currentTime - segment.start, segment);
                }

                // Add progress bar at top
                const progress = (videoElement.currentTime - segment.start) / (segment.end - segment.start);
                this.drawProgressBar(ctx, canvas, progress);

                ctx.restore();

                frameCount++;
                requestAnimationFrame(renderFrame);
            };

            videoElement.play();
            renderFrame();
        });
    }

    /**
     * Apply viral effects (zooms, shakes, particles)
     */
    applyViralEffects(ctx, canvas, frameCount, style) {
        // Dynamic zoom pulses
        if (frameCount % 60 < 15) { // Zoom every 2 seconds
            const zoomProgress = (frameCount % 60) / 15;
            const scale = 1 + (Math.sin(zoomProgress * Math.PI) * 0.05);
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale, scale);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Screen shake for emphasis (random moments)
        if (Math.random() > 0.98) {
            const shakeX = (Math.random() - 0.5) * 10;
            const shakeY = (Math.random() - 0.5) * 10;
            ctx.translate(shakeX, shakeY);
        }

        // Color pop effect
        if (style === 'energetic') {
            ctx.filter = 'contrast(1.15) saturate(1.3)';
        }

        // Vignette for focus
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.height / 2
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Add viral-style captions (large, bold, animated)
     */
    addViralCaptions(ctx, canvas, currentTime, segment) {
        // Sample captions (in production, use speech-to-text)
        const captions = this.generateSampleCaptions(segment);
        
        const caption = captions.find(c => 
            currentTime >= c.start && currentTime <= c.end
        );

        if (!caption) return;

        // Viral caption style
        ctx.save();
        
        const words = caption.text.split(' ');
        const fontSize = 80;
        ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const y = canvas.height * 0.5;
        let currentY = y - ((words.length - 1) * fontSize) / 2;

        words.forEach((word, idx) => {
            // Animate each word
            const wordProgress = (currentTime - caption.start) / (caption.end - caption.start);
            const wordDelay = idx * 0.1;
            
            if (wordProgress > wordDelay) {
                const wordAlpha = Math.min(1, (wordProgress - wordDelay) * 5);
                const scale = 0.8 + Math.min(0.2, (wordProgress - wordDelay) * 2);
                
                ctx.save();
                ctx.globalAlpha = wordAlpha;
                ctx.translate(canvas.width / 2, currentY);
                ctx.scale(scale, scale);
                
                // Stroke (outline)
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 12;
                ctx.lineJoin = 'round';
                ctx.strokeText(word, 0, 0);
                
                // Fill (main text)
                ctx.fillStyle = '#FFFF00'; // Viral yellow
                ctx.fillText(word, 0, 0);
                
                ctx.restore();
                currentY += fontSize;
            }
        });

        ctx.restore();
    }

    /**
     * Generate sample captions (replace with speech-to-text in production)
     */
    generateSampleCaptions(segment) {
        const duration = segment.end - segment.start;
        const captions = [];
        
        // Sample viral phrases for book reviews
        const phrases = [
            "THIS BOOK CHANGED",
            "MY LIFE FOREVER",
            "YOU NEED TO READ THIS",
            "MIND BLOWING PLOT TWIST",
            "COULDN'T PUT IT DOWN",
            "ABSOLUTELY INCREDIBLE",
            "BEST BOOK EVER"
        ];

        let currentTime = 0;
        phrases.forEach((phrase, idx) => {
            if (currentTime < duration) {
                captions.push({
                    start: currentTime,
                    end: currentTime + 2,
                    text: phrase
                });
                currentTime += 2.5;
            }
        });

        return captions;
    }

    /**
     * Draw progress bar
     */
    drawProgressBar(ctx, canvas, progress) {
        ctx.save();
        
        const barHeight = 6;
        const barY = 40;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, barY, canvas.width, barHeight);
        
        // Progress
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#6a0dad');
        gradient.addColorStop(1, '#ffd700');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, barY, canvas.width * progress, barHeight);
        
        ctx.restore();
    }

    /**
     * Add emoji reactions (for viral effect)
     */
    addEmojiReactions(ctx, canvas, frameCount) {
        const emojis = ['🔥', '💯', '😱', '🤯', '❤️', '⚡'];
        
        if (frameCount % 120 === 0) { // Every 4 seconds
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const x = Math.random() * canvas.width;
            const y = canvas.height * 0.7;
            
            ctx.font = '60px Arial';
            ctx.fillText(emoji, x, y);
        }
    }

    /**
     * Generate hook/teaser text
     */
    generateHookText(segment) {
        const hooks = [
            "Wait for it... 👀",
            "This will blow your mind 🤯",
            "You won't believe this... 😱",
            "The ending though! 🔥",
            "Plot twist incoming... ⚡",
            "This part is INSANE 💯"
        ];
        
        return hooks[Math.floor(Math.random() * hooks.length)];
    }

    /**
     * Add call-to-action
     */
    addCTA(ctx, canvas) {
        ctx.save();
        
        const cta = "Follow for more! 👆";
        ctx.font = 'bold 48px Impact';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        
        const y = canvas.height - 150;
        
        ctx.strokeText(cta, canvas.width / 2, y);
        ctx.fillText(cta, canvas.width / 2, y);
        
        ctx.restore();
    }

    /**
     * Export short with metadata
     */
    exportShort(blob, index, segment) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `viral_short_${index + 1}_${Date.now()}.webm`;
        return {
            blob,
            url,
            download: a,
            metadata: {
                index,
                duration: segment.end - segment.start,
                start: segment.start,
                end: segment.end,
                score: segment.score
            }
        };
    }
}

// Export
window.ShortsGenerator = ShortsGenerator;
