/**
 * Motion Graphics Engine
 * Creates cinematic overlays, animations, and effects
 * All rendered locally in browser using Canvas API
 */

class MotionGraphicsEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animations = [];
        this.particles = [];
    }

    /**
     * Render a title card with animation
     */
    renderTitleCard(text, style, animation, progress) {
        const { fontFamily, fontSize, color, shadow } = style;
        
        this.ctx.save();
        
        // Animation transforms
        if (animation === 'fade_zoom') {
            const scale = 0.8 + (progress * 0.2);
            const alpha = progress;
            
            this.ctx.globalAlpha = alpha;
            this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        }
        
        // Apply shadow
        if (shadow) {
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 20;
        }
        
        // Draw text
        this.ctx.font = `bold ${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.restore();
    }

    /**
     * Render chapter marker
     */
    renderChapterMarker(text, style, animation, progress) {
        const { fontFamily, fontSize, color, background } = style;
        
        this.ctx.save();
        
        // Animation
        let offsetX = 0;
        if (animation === 'slide_fade') {
            offsetX = (1 - progress) * -300;
            this.ctx.globalAlpha = progress;
        }
        
        // Background bar
        const barHeight = 80;
        const barWidth = this.canvas.width * 0.4;
        const x = 50 + offsetX;
        const y = 50;
        
        this.ctx.fillStyle = background;
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Text
        this.ctx.font = `${fontSize}px ${fontFamily}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + 30, y + barHeight / 2);
        
        this.ctx.restore();
    }

    /**
     * Render quote overlay with typewriter effect
     */
    renderQuote(text, style, animation, progress) {
        const { fontFamily, fontSize, color, italic } = style;
        
        this.ctx.save();
        
        // Calculate visible text length for typewriter
        const visibleLength = animation === 'typewriter' 
            ? Math.floor(text.length * progress)
            : text.length;
        const visibleText = text.substring(0, visibleLength);
        
        // Semi-transparent background
        const padding = 40;
        this.ctx.font = `${italic ? 'italic' : ''} ${fontSize}px ${fontFamily}`;
        const textWidth = this.ctx.measureText(text).width;
        
        const boxX = (this.canvas.width - textWidth) / 2 - padding;
        const boxY = this.canvas.height * 0.7 - fontSize - padding;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = fontSize + padding * 2;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Quote marks
        this.ctx.fillStyle = color;
        this.ctx.font = `bold ${fontSize * 1.5}px Georgia`;
        this.ctx.fillText('"', boxX + 10, boxY + fontSize);
        
        // Text
        this.ctx.font = `${italic ? 'italic' : ''} ${fontSize}px ${fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(visibleText, this.canvas.width / 2, this.canvas.height * 0.7);
        
        this.ctx.restore();
    }

    /**
     * Create and render particle effects
     */
    renderParticles(effect, density, color, deltaTime) {
        const maxParticles = {
            low: 20,
            medium: 50,
            high: 100
        }[density] || 20;

        // Create new particles
        while (this.particles.length < maxParticles) {
            this.particles.push(this.createParticle(effect, color));
        }

        // Update and render particles
        this.ctx.save();
        
        this.particles.forEach((particle, index) => {
            this.updateParticle(particle, effect, deltaTime);
            this.drawParticle(particle, effect);
            
            // Remove dead particles
            if (particle.life <= 0 || particle.y < -50) {
                this.particles.splice(index, 1);
            }
        });
        
        this.ctx.restore();
    }

    createParticle(effect, color) {
        const particle = {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + 50,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            size: Math.random() * 4 + 2,
            life: 1.0,
            color: color,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };

        if (effect === 'floating_sparkles') {
            particle.vy = -Math.random() * 2 - 0.5;
            particle.vx = (Math.random() - 0.5) * 1;
            particle.size = Math.random() * 6 + 2;
        }

        return particle;
    }

    updateParticle(particle, effect, deltaTime) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        particle.life -= deltaTime * 0.3;

        if (effect === 'floating_sparkles') {
            // Add sine wave motion
            particle.vx = Math.sin(particle.y * 0.01) * 0.5;
        }
    }

    drawParticle(particle, effect) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);

        if (effect === 'floating_sparkles') {
            // Draw sparkle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const x = Math.cos(angle) * particle.size;
                const y = Math.sin(angle) * particle.size;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (particle.size * 0.4);
                const innerY = Math.sin(innerAngle) * (particle.size * 0.4);
                this.ctx.lineTo(innerX, innerY);
            }
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            // Draw circle
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Render transition effects
     */
    renderTransition(type, progress) {
        this.ctx.save();
        
        switch (type) {
            case 'fade':
                this.ctx.fillStyle = `rgba(0, 0, 0, ${progress})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;
                
            case 'slide':
                const offset = this.canvas.width * progress;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(this.canvas.width - offset, 0, offset, this.canvas.height);
                break;
                
            case 'zoom':
                const scale = 1 + progress * 0.5;
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
                break;
                
            case 'wipe':
                const wipeHeight = this.canvas.height * progress;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, wipeHeight);
                break;
                
            case 'iris':
                const maxRadius = Math.sqrt(
                    Math.pow(this.canvas.width / 2, 2) + 
                    Math.pow(this.canvas.height / 2, 2)
                );
                const currentRadius = maxRadius * (1 - progress);
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.arc(
                    this.canvas.width / 2,
                    this.canvas.height / 2,
                    currentRadius,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.globalCompositeOperation = 'source-over';
                break;
        }
        
        this.ctx.restore();
    }

    /**
     * Render lower third banner
     */
    renderLowerThird(text, subtext, style, progress) {
        this.ctx.save();
        
        const slideIn = Math.min(progress * 2, 1);
        const offsetX = (1 - slideIn) * -this.canvas.width;
        
        // Main bar
        const barHeight = 100;
        const y = this.canvas.height - 150;
        
        this.ctx.fillStyle = style.background || 'rgba(106, 13, 173, 0.9)';
        this.ctx.fillRect(offsetX, y, this.canvas.width * 0.6, barHeight);
        
        // Accent bar
        this.ctx.fillStyle = style.accentColor || '#ffd700';
        this.ctx.fillRect(offsetX, y, 10, barHeight);
        
        // Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(text, offsetX + 30, y + 35);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(subtext, offsetX + 30, y + 70);
        
        this.ctx.restore();
    }

    /**
     * Render cinematic bars (letterbox)
     */
    renderCinematicBars(height = 100, opacity = 0.8) {
        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, height);
        this.ctx.fillRect(0, this.canvas.height - height, this.canvas.width, height);
        this.ctx.restore();
    }

    /**
     * Render progress indicator
     */
    renderProgressBar(progress, style) {
        this.ctx.save();
        
        const barWidth = this.canvas.width * 0.8;
        const barHeight = 6;
        const x = (this.canvas.width - barWidth) / 2;
        const y = this.canvas.height - 30;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Progress
        this.ctx.fillStyle = style.color || '#6a0dad';
        this.ctx.fillRect(x, y, barWidth * progress, barHeight);
        
        this.ctx.restore();
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Apply film grain effect
     */
    applyFilmGrain(intensity = 0.1) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity * 255;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Apply vignette effect
     */
    applyVignette(intensity = 0.5) {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Export for use
window.MotionGraphicsEngine = MotionGraphicsEngine;
