/**
 * Professional Video Effects Engine
 * High-quality effects for broadcast-level videos
 */

class ProfessionalEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    /**
     * Auto color grading (cinematic look)
     */
    applyColorGrading(style = 'cinematic') {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        const profiles = {
            cinematic: {
                shadows: { r: -10, g: 5, b: 15 },
                midtones: { r: 5, g: 0, b: -5 },
                highlights: { r: 10, g: 5, b: -10 },
                saturation: 1.2,
                contrast: 1.15
            },
            warm: {
                shadows: { r: 10, g: 5, b: -15 },
                midtones: { r: 15, g: 5, b: -10 },
                highlights: { r: 20, g: 10, b: -15 },
                saturation: 1.3,
                contrast: 1.1
            },
            cool: {
                shadows: { r: -15, g: -5, b: 20 },
                midtones: { r: -10, g: 0, b: 15 },
                highlights: { r: -5, g: 5, b: 25 },
                saturation: 1.15,
                contrast: 1.2
            },
            vibrant: {
                shadows: { r: 0, g: 0, b: 0 },
                midtones: { r: 0, g: 0, b: 0 },
                highlights: { r: 0, g: 0, b: 0 },
                saturation: 1.5,
                contrast: 1.25
            }
        };

        const profile = profiles[style] || profiles.cinematic;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // Calculate luminance
            const lum = (r + g + b) / 3;

            // Apply lift/gamma/gain based on luminance
            if (lum < 85) { // Shadows
                r += profile.shadows.r;
                g += profile.shadows.g;
                b += profile.shadows.b;
            } else if (lum < 170) { // Midtones
                r += profile.midtones.r;
                g += profile.midtones.g;
                b += profile.midtones.b;
            } else { // Highlights
                r += profile.highlights.r;
                g += profile.highlights.g;
                b += profile.highlights.b;
            }

            // Saturation
            const gray = (r + g + b) / 3;
            r = gray + (r - gray) * profile.saturation;
            g = gray + (g - gray) * profile.saturation;
            b = gray + (b - gray) * profile.saturation;

            // Contrast
            r = ((r / 255 - 0.5) * profile.contrast + 0.5) * 255;
            g = ((g / 255 - 0.5) * profile.contrast + 0.5) * 255;
            b = ((b / 255 - 0.5) * profile.contrast + 0.5) * 255;

            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        this.ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Dynamic zoom on subject (Ken Burns effect)
     */
    applyDynamicZoom(progress, intensity = 0.1) {
        const scale = 1 + Math.sin(progress * Math.PI * 2) * intensity;
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
    }

    /**
     * Professional transition effects
     */
    renderTransition(type, progress) {
        this.ctx.save();

        switch (type) {
            case 'cross_dissolve':
                this.ctx.globalAlpha = 1 - progress;
                break;

            case 'dip_to_black':
                const dipProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
                this.ctx.fillStyle = `rgba(0, 0, 0, ${dipProgress})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case 'dip_to_white':
                const dipWhiteProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${dipWhiteProgress})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                break;

            case 'wipe_right':
                const wipeX = this.canvas.width * progress;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, wipeX, this.canvas.height);
                break;

            case 'wipe_down':
                const wipeY = this.canvas.height * progress;
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, wipeY);
                break;

            case 'zoom_blur':
                const blurAmount = Math.sin(progress * Math.PI) * 10;
                this.ctx.filter = `blur(${blurAmount}px)`;
                break;

            case 'spin':
                this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.rotate(progress * Math.PI * 2);
                this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
                break;
        }

        this.ctx.restore();
    }

    /**
     * Lower third graphics (professional overlays)
     */
    renderLowerThird(text, subtitle, style, progress) {
        this.ctx.save();

        const slideIn = Math.min(progress * 2, 1);
        const slideOut = progress > 0.8 ? (1 - progress) * 5 : 1;
        const opacity = Math.min(slideIn, slideOut);

        this.ctx.globalAlpha = opacity;

        const offsetX = (1 - slideIn) * -400;
        const y = this.canvas.height - 200;

        // Background bar
        const gradient = this.ctx.createLinearGradient(offsetX, y, offsetX + 600, y);
        gradient.addColorStop(0, 'rgba(106, 13, 173, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(offsetX, y, 600, 100);

        // Accent line
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(offsetX, y, 8, 100);

        // Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(text, offsetX + 30, y + 40);

        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(subtitle, offsetX + 30, y + 75);

        this.ctx.restore();
    }

    /**
     * Lens flare effect
     */
    renderLensFlare(x, y, intensity = 1) {
        this.ctx.save();

        // Main flare
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 150 * intensity);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Secondary flares
        for (let i = 0; i < 5; i++) {
            const offsetX = (x - this.canvas.width / 2) * (0.2 + i * 0.15);
            const offsetY = (y - this.canvas.height / 2) * (0.2 + i * 0.15);
            const flareX = this.canvas.width / 2 + offsetX;
            const flareY = this.canvas.height / 2 + offsetY;

            const flareGradient = this.ctx.createRadialGradient(
                flareX, flareY, 0,
                flareX, flareY, 30 + i * 10
            );
            flareGradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
            flareGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

            this.ctx.fillStyle = flareGradient;
            this.ctx.beginPath();
            this.ctx.arc(flareX, flareY, 30 + i * 10, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    /**
     * Motion blur effect
     */
    applyMotionBlur(direction = 'horizontal', intensity = 5) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const blurred = this.ctx.createImageData(this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;

                for (let i = -intensity; i <= intensity; i++) {
                    let sampleX = x;
                    let sampleY = y;

                    if (direction === 'horizontal') {
                        sampleX = x + i;
                    } else {
                        sampleY = y + i;
                    }

                    if (sampleX >= 0 && sampleX < this.canvas.width && 
                        sampleY >= 0 && sampleY < this.canvas.height) {
                        const idx = (sampleY * this.canvas.width + sampleX) * 4;
                        r += imageData.data[idx];
                        g += imageData.data[idx + 1];
                        b += imageData.data[idx + 2];
                        a += imageData.data[idx + 3];
                        count++;
                    }
                }

                const idx = (y * this.canvas.width + x) * 4;
                blurred.data[idx] = r / count;
                blurred.data[idx + 1] = g / count;
                blurred.data[idx + 2] = b / count;
                blurred.data[idx + 3] = a / count;
            }
        }

        this.ctx.putImageData(blurred, 0, 0);
    }

    /**
     * Depth of field blur (focus effect)
     */
    applyDepthOfField(focusY, intensity = 5) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const blurred = this.ctx.createImageData(this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.canvas.height; y++) {
            // Calculate blur amount based on distance from focus
            const distance = Math.abs(y - focusY);
            const blurAmount = Math.min(intensity, (distance / this.canvas.height) * intensity * 2);

            for (let x = 0; x < this.canvas.width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;

                for (let dy = -blurAmount; dy <= blurAmount; dy++) {
                    for (let dx = -blurAmount; dx <= blurAmount; dx++) {
                        const sampleX = x + dx;
                        const sampleY = y + dy;

                        if (sampleX >= 0 && sampleX < this.canvas.width &&
                            sampleY >= 0 && sampleY < this.canvas.height) {
                            const idx = (sampleY * this.canvas.width + sampleX) * 4;
                            r += imageData.data[idx];
                            g += imageData.data[idx + 1];
                            b += imageData.data[idx + 2];
                            a += imageData.data[idx + 3];
                            count++;
                        }
                    }
                }

                const idx = (y * this.canvas.width + x) * 4;
                blurred.data[idx] = r / count;
                blurred.data[idx + 1] = g / count;
                blurred.data[idx + 2] = b / count;
                blurred.data[idx + 3] = a / count;
            }
        }

        this.ctx.putImageData(blurred, 0, 0);
    }

    /**
     * Add professional watermark
     */
    addWatermark(text, position = 'bottom-right', opacity = 0.5) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;

        let x, y;
        switch (position) {
            case 'top-right':
                x = this.canvas.width - 30;
                y = 40;
                this.ctx.textAlign = 'right';
                break;
            case 'bottom-left':
                x = 30;
                y = this.canvas.height - 30;
                this.ctx.textAlign = 'left';
                break;
            case 'bottom-right':
            default:
                x = this.canvas.width - 30;
                y = this.canvas.height - 30;
                this.ctx.textAlign = 'right';
                break;
        }

        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);

        this.ctx.restore();
    }

    /**
     * Sharpen video
     */
    applySharpen(intensity = 1) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sharpening kernel
        const kernel = [
            0, -intensity, 0,
            -intensity, 1 + 4 * intensity, -intensity,
            0, -intensity, 0
        ];

        const output = new Uint8ClampedArray(data);

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let sum = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            sum += data[idx] * kernel[kernelIdx];
                        }
                    }
                    output[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, sum));
                }
            }
        }

        for (let i = 0; i < data.length; i++) {
            data[i] = output[i];
        }

        this.ctx.putImageData(imageData, 0, 0);
    }
}

// Export
window.ProfessionalEffects = ProfessionalEffects;
