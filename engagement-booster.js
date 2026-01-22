/**
 * Engagement Booster for Book Reviews
 * Keeps viewers hooked with dynamic visual elements
 * Perfect for esoteric/mystical content
 */

class EngagementBooster {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.brollImages = [];
        this.quotes = [];
        this.chapterMarkers = [];
        this.retentionHooks = [];
        this.soundEffects = {};
    }

    /**
     * Initialize with user's B-roll assets
     */
    loadBrollAssets(images) {
        this.brollImages = images;
        console.log(`📸 Loaded ${images.length} B-roll images`);
    }

    /**
     * Generate retention hooks automatically
     * These appear every 8-10 seconds to keep attention
     */
    generateRetentionHooks(videoDuration, style = 'mystical') {
        const hooks = [];
        const interval = 10; // Every 10 seconds
        
        const mysticalHooks = [
            "🔮 But there's more...",
            "⚡ This part is crucial",
            "🌙 The hidden meaning",
            "📖 Ancient wisdom ahead",
            "✨ Pay attention here",
            "🗝️ The secret is...",
            "⭐ This will blow your mind",
            "🎭 The truth revealed",
            "🔥 Hot take incoming",
            "💎 Rare insight",
            "🌟 Game changer",
            "🧙 The author's secret",
            "📚 Historical context",
            "⚠️ Plot twist alert",
            "🎯 Key takeaway"
        ];

        for (let time = interval; time < videoDuration; time += interval) {
            hooks.push({
                time,
                text: mysticalHooks[hooks.length % mysticalHooks.length],
                duration: 2,
                type: 'retention_hook'
            });
        }

        this.retentionHooks = hooks;
        return hooks;
    }

    /**
     * Render B-roll overlay with smooth transitions
     */
    renderBrollOverlay(currentTime, intensity = 0.7) {
        // Find if we should show B-roll at this time
        const brollIndex = Math.floor(currentTime / 15) % this.brollImages.length;
        
        if (this.brollImages.length === 0) return;

        const broll = this.brollImages[brollIndex];
        if (!broll || !broll.image) return;

        this.ctx.save();
        
        // Fade in/out at segment boundaries
        const segmentProgress = (currentTime % 15) / 15;
        let alpha = intensity;
        
        if (segmentProgress < 0.1) {
            alpha *= segmentProgress * 10;
        } else if (segmentProgress > 0.9) {
            alpha *= (1 - segmentProgress) * 10;
        }

        this.ctx.globalAlpha = alpha;

        // Position based on mode
        const mode = broll.mode || 'corner';
        
        switch(mode) {
            case 'fullscreen':
                // Full screen with slight zoom
                const scale = 1.05;
                this.ctx.drawImage(
                    broll.image,
                    -this.canvas.width * (scale - 1) / 2,
                    -this.canvas.height * (scale - 1) / 2,
                    this.canvas.width * scale,
                    this.canvas.height * scale
                );
                break;
                
            case 'corner':
                // Top right corner
                const cornerWidth = this.canvas.width * 0.25;
                const cornerHeight = cornerWidth * (broll.image.height / broll.image.width);
                this.ctx.drawImage(
                    broll.image,
                    this.canvas.width - cornerWidth - 20,
                    20,
                    cornerWidth,
                    cornerHeight
                );
                break;
                
            case 'split':
                // Right half of screen
                this.ctx.drawImage(
                    broll.image,
                    this.canvas.width / 2,
                    0,
                    this.canvas.width / 2,
                    this.canvas.height
                );
                break;
        }

        this.ctx.restore();
    }

    /**
     * Render animated quote overlays
     */
    renderAnimatedQuote(quote, progress) {
        this.ctx.save();

        const fadeIn = Math.min(progress * 3, 1);
        const fadeOut = progress > 0.8 ? (1 - progress) * 5 : 1;
        const alpha = Math.min(fadeIn, fadeOut);

        this.ctx.globalAlpha = alpha;

        // Mystical background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(106, 13, 173, 0.9)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Mystical border
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(50, 50, this.canvas.width - 100, this.canvas.height - 100);

        // Corner ornaments
        this.drawMysticalOrnament(80, 80, 30);
        this.drawMysticalOrnament(this.canvas.width - 80, 80, 30);
        this.drawMysticalOrnament(80, this.canvas.height - 80, 30);
        this.drawMysticalOrnament(this.canvas.width - 80, this.canvas.height - 80, 30);

        // Quote text with typewriter effect
        const visibleLength = Math.floor(quote.text.length * progress);
        const visibleText = quote.text.substring(0, visibleLength);

        this.ctx.font = 'italic 48px Georgia';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Word wrap
        const words = visibleText.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            const testLine = currentLine + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            if (metrics.width > this.canvas.width - 200 && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);

        // Draw lines
        const lineHeight = 60;
        const startY = (this.canvas.height - (lines.length * lineHeight)) / 2;
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line.trim(), this.canvas.width / 2, startY + i * lineHeight);
        });

        // Author attribution
        if (quote.author && progress > 0.5) {
            this.ctx.font = '32px Georgia';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(
                `— ${quote.author}`,
                this.canvas.width / 2,
                this.canvas.height - 100
            );
        }

        this.ctx.restore();
    }

    /**
     * Draw mystical ornaments
     */
    drawMysticalOrnament(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Pentagram or mystical symbol
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 4 / 5) - Math.PI / 2;
            const px = Math.cos(angle) * size;
            const py = Math.sin(angle) * size;
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    /**
     * Render chapter markers with visual breaks
     */
    renderChapterMarker(chapter, progress) {
        this.ctx.save();

        // Animated wipe transition
        const wipeProgress = Math.min(progress * 2, 1);
        
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Chapter number with glow
        this.ctx.shadowColor = '#6a0dad';
        this.ctx.shadowBlur = 30;
        this.ctx.font = 'bold 120px Arial';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.textAlign = 'center';
        
        const scale = 0.8 + (Math.sin(wipeProgress * Math.PI) * 0.2);
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2 - 100);
        this.ctx.scale(scale, scale);
        this.ctx.fillText(`CHAPTER ${chapter.number}`, 0, 0);
        this.ctx.restore();

        // Chapter title
        this.ctx.shadowBlur = 20;
        this.ctx.font = '48px Georgia';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(chapter.title, this.canvas.width / 2, this.canvas.height / 2 + 50);

        // Progress line
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(
            (this.canvas.width - 400) / 2,
            this.canvas.height / 2 + 120,
            400 * wipeProgress,
            4
        );

        this.ctx.restore();
    }

    /**
     * Render retention hooks
     */
    renderRetentionHook(hook, progress) {
        this.ctx.save();

        // Pop-in animation
        const scale = 0.5 + Math.min(progress * 2, 0.5);
        const alpha = Math.min(progress * 3, 1);

        this.ctx.globalAlpha = alpha;
        this.ctx.translate(this.canvas.width / 2, 150);
        this.ctx.scale(scale, scale);

        // Background badge
        const badgeWidth = 400;
        const badgeHeight = 80;
        
        const gradient = this.ctx.createLinearGradient(-badgeWidth/2, 0, badgeWidth/2, 0);
        gradient.addColorStop(0, 'rgba(106, 13, 173, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.95)');
        
        this.ctx.fillStyle = gradient;
        this.roundRect(-badgeWidth/2, -badgeHeight/2, badgeWidth, badgeHeight, 40);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.roundRect(-badgeWidth/2, -badgeHeight/2, badgeWidth, badgeHeight, 40);
        this.ctx.stroke();

        // Text
        this.ctx.font = 'bold 36px Impact';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(hook.text, 0, 0);

        this.ctx.restore();
    }

    /**
     * Round rectangle helper
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    /**
     * Add emphasis zoom for key moments
     */
    applyEmphasisZoom(progress, intensity = 0.1) {
        const zoom = 1 + Math.sin(progress * Math.PI) * intensity;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }

    /**
     * Pattern interrupt - sudden visual change to reset attention
     */
    renderPatternInterrupt(type, progress) {
        this.ctx.save();

        switch(type) {
            case 'flash':
                const flashAlpha = Math.sin(progress * Math.PI * 4) * 0.3;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case 'shake':
                const shakeX = Math.sin(progress * Math.PI * 20) * 10;
                const shakeY = Math.cos(progress * Math.PI * 20) * 10;
                this.ctx.translate(shakeX, shakeY);
                break;

            case 'color_shift':
                const hue = progress * 360;
                this.ctx.filter = `hue-rotate(${hue}deg)`;
                break;

            case 'zoom_pulse':
                const pulse = 1 + Math.sin(progress * Math.PI * 6) * 0.05;
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.scale(pulse, pulse);
                this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
                break;
        }

        this.ctx.restore();
    }

    /**
     * Mystical particle effects
     */
    renderMysticalParticles(time) {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time * 0.001;
            const radius = 200 + Math.sin(time * 0.002 + i) * 50;
            
            const x = this.canvas.width / 2 + Math.cos(angle) * radius;
            const y = this.canvas.height / 2 + Math.sin(angle) * radius;
            
            const size = 3 + Math.sin(time * 0.005 + i) * 2;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = i % 2 === 0 ? '#6a0dad' : '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Lower third with key points
     */
    renderKeyPointLowerThird(point, progress) {
        this.ctx.save();

        const slideIn = Math.min(progress * 2, 1);
        const y = this.canvas.height - 150;
        const x = 50 + (1 - slideIn) * -500;

        // Background
        this.ctx.fillStyle = 'rgba(106, 13, 173, 0.9)';
        this.ctx.fillRect(x, y, 700, 100);

        // Accent line
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(x, y, 10, 100);

        // Icon
        this.ctx.font = '48px Arial';
        this.ctx.fillText(point.icon || '📖', x + 30, y + 60);

        // Text
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(point.text, x + 100, y + 60);

        this.ctx.restore();
    }

    /**
     * "Rule of 3s" formatter - Present info in 3 parts
     */
    renderRuleOfThree(items, currentIndex, progress) {
        this.ctx.save();

        const itemHeight = 100;
        const startY = (this.canvas.height - (items.length * itemHeight)) / 2;

        items.forEach((item, i) => {
            const y = startY + i * itemHeight;
            const isActive = i === currentIndex;
            
            // Highlight current item
            if (isActive) {
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                this.ctx.fillRect(100, y, this.canvas.width - 200, itemHeight - 10);
            }

            // Number badge
            this.ctx.fillStyle = isActive ? '#ffd700' : 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(150, y + 50, 30, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.font = 'bold 32px Arial';
            this.ctx.fillStyle = '#000000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((i + 1).toString(), 150, y + 60);

            // Item text
            this.ctx.font = isActive ? 'bold 36px Arial' : '28px Arial';
            this.ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item, 200, y + 60);

            // Check mark when complete
            if (i < currentIndex) {
                this.ctx.font = '40px Arial';
                this.ctx.fillStyle = '#4CAF50';
                this.ctx.fillText('✓', this.canvas.width - 150, y + 60);
            }
        });

        this.ctx.restore();
    }

    /**
     * Generate chapter markers from video
     */
    generateChapterMarkers(videoDuration, chapterCount = 5) {
        const chapters = [];
        const mysticalThemes = [
            'The Hidden Truth',
            'Ancient Secrets',
            'Forbidden Knowledge',
            'The Revelation',
            'Ultimate Understanding',
            'Cosmic Wisdom',
            'Sacred Mysteries',
            'The Awakening'
        ];

        const interval = videoDuration / chapterCount;

        for (let i = 0; i < chapterCount; i++) {
            chapters.push({
                number: i + 1,
                title: mysticalThemes[i % mysticalThemes.length],
                time: i * interval,
                duration: 3
            });
        }

        this.chapterMarkers = chapters;
        return chapters;
    }

    /**
     * Create timestamp overlays for key quotes
     */
    addTimestampedQuote(time, text, author = '') {
        this.quotes.push({
            time,
            duration: 5,
            text,
            author,
            type: 'quote'
        });
    }

    /**
     * Master render function - calls all active overlays
     */
    render(currentTime, videoTime, frameTime) {
        // Check for retention hooks
        const activeHook = this.retentionHooks.find(h => 
            currentTime >= h.time && currentTime < h.time + h.duration
        );
        if (activeHook) {
            const progress = (currentTime - activeHook.time) / activeHook.duration;
            this.renderRetentionHook(activeHook, progress);
        }

        // Check for chapter markers
        const activeChapter = this.chapterMarkers.find(c =>
            currentTime >= c.time && currentTime < c.time + c.duration
        );
        if (activeChapter) {
            const progress = (currentTime - activeChapter.time) / activeChapter.duration;
            this.renderChapterMarker(activeChapter, progress);
        }

        // Check for quotes
        const activeQuote = this.quotes.find(q =>
            currentTime >= q.time && currentTime < q.time + q.duration
        );
        if (activeQuote) {
            const progress = (currentTime - activeQuote.time) / activeQuote.duration;
            this.renderAnimatedQuote(activeQuote, progress);
        }

        // Mystical particles (always active at low opacity)
        if (Math.random() > 0.95) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3;
            this.renderMysticalParticles(frameTime);
            this.ctx.restore();
        }
    }
}

// Export
window.EngagementBooster = EngagementBooster;
