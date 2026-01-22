/**
 * Main Application Controller
 * Integrates all modules: audio, shorts, effects
 */

// Initialize processors
let audioProcessor = null;
let shortsGenerator = null;
let professionalEffects = null;
let currentVideoFile = null;

// Storage management
const storage = {
    save(key, data) {
        localStorage.setItem(`magick_${key}`, JSON.stringify(data));
    },
    load(key) {
        const data = localStorage.getItem(`magick_${key}`);
        return data ? JSON.parse(data) : null;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    audioProcessor = new AudioProcessor();
    await audioProcessor.initialize();
    
    shortsGenerator = new ShortsGenerator();
    
    console.log('✅ All systems initialized');
    setupUI();
    loadSettings();
});

// Tab switching
function setupUI() {
        document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
                window.engagementBooster = setupEngagementFeatures();
}
        });
    });

    setupVideoUpload();
    setupBrandSettings();
    setupAssetManagement();
    setupShortsGenerator();
    setupAudioVisualization();
}

// Video upload handling
function setupVideoUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const videoInput = document.getElementById('videoInput');
    const editingInterface = document.getElementById('editingInterface');

    uploadZone.addEventListener('click', () => videoInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.background = 'rgba(106, 13, 173, 0.3)';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.background = 'rgba(106, 13, 173, 0.1)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.background = 'rgba(106, 13, 173, 0.1)';
        if (e.dataTransfer.files[0]) {
            loadVideo(e.dataTransfer.files[0]);
        }
    });

    videoInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            loadVideo(e.target.files[0]);
        }
    });

    document.getElementById('processBtn').addEventListener('click', processFullVideo);
}

// Load video
async function loadVideo(file) {
    currentVideoFile = file;
    const url = URL.createObjectURL(file);
    
    const originalVideo = document.getElementById('originalVideo');
    const previewVideo = document.getElementById('previewVideo');
    
    // Reset audio processor for new video
    if (audioProcessor) {
        audioProcessor.sourceNode = null;
    }
    
    originalVideo.src = url;
    previewVideo.src = url;
    
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('editingInterface').style.display = 'block';

    originalVideo.addEventListener('loadedmetadata', async () => {
        const duration = originalVideo.duration.toFixed(2);
        const size = (file.size / 1024 / 1024).toFixed(2);
        document.getElementById('videoInfo').textContent = 
            `Duration: ${duration}s | Size: ${size} MB | ${originalVideo.videoWidth}x${originalVideo.videoHeight}`;

        // Auto-analyze audio (but don't connect to output yet)
        if (document.getElementById('autoAudioEnhance').checked) {
            showStatus('🎙️ Analyzing audio quality...', 'info');
            try {
                const audioAnalysis = await audioProcessor.analyzeAudio(originalVideo);
                console.log('Audio analysis:', audioAnalysis);
                showStatus(`✅ Found ${audioAnalysis.silentSegments.length} silent segments to trim`, 'success');
            } catch (err) {
                console.error('Audio analysis error:', err);
                // Don't show error - analysis is optional
            }
        }

        // Enable shorts generation
        document.getElementById('generateShortsBtn').disabled = false;
    }, { once: true }); // Only run once
}

// Process full video
async function processFullVideo() {
    if (!currentVideoFile) return;

    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = true;
    processBtn.textContent = '⏳ Processing...';
    document.getElementById('processingSteps').innerHTML = '';

    try {
        updateProgress(5, 'Initializing...');

        const originalVideo = document.getElementById('originalVideo');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set output resolution
        canvas.width = originalVideo.videoWidth;
        canvas.height = originalVideo.videoHeight;

        professionalEffects = new ProfessionalEffects(canvas);

        updateProgress(10, 'Analyzing video content...');

        // Get brand settings
        const brandSettings = loadSettings();
        const editStyle = document.getElementById('editStyle').value;
        const videoTitle = document.getElementById('videoTitle').value;

        updateProgress(20, 'Enhancing audio...');

        // Apply audio enhancements (only if not already connected)
        if (document.getElementById('autoAudioEnhance').checked) {
            try {
                await audioProcessor.enhanceAudio(originalVideo, {
                    noiseReduction: brandSettings.noiseReduction,
                    bassBoost: brandSettings.bassBoost,
                    voiceClarity: brandSettings.voiceClarity,
                    compression: brandSettings.compression
                });
            } catch (err) {
                console.warn('Audio enhancement skipped:', err.message);
                // Continue without audio enhancement
            }
        }

        updateProgress(30, 'Setting up video processing...');

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerRecent: 8000000
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        await new Promise((resolve) => {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                downloadVideo(blob, videoTitle || 'edited_video');
                updateProgress(100, 'Complete! Downloading...');
                resolve();
            };

            originalVideo.currentTime = 0;
            mediaRecorder.start();

            let frameCount = 0;
            const fps = 30;
            const totalFrames = Math.floor(originalVideo.duration * fps);

            function renderFrame() {
                if (originalVideo.ended || originalVideo.paused) {
                    mediaRecorder.stop();
                    return;
                }

                ctx.save();

                // Draw video frame
                ctx.drawImage(originalVideo, 0, 0, canvas.width, canvas.height);

                // Apply color grading
                if (brandSettings.autoColorGrade) {
                    professionalEffects.applyColorGrading(editStyle);
                }

                // Apply professional effects
                const progress = originalVideo.currentTime / originalVideo.duration;

                // Dynamic zoom on key moments
                if (document.getElementById('autoDynamicZoom').checked) {
                    if (progress > 0.3 && progress < 0.7) {
                        professionalEffects.applyDynamicZoom(progress, 0.05);
                    }
                }

                // Cinematic bars
                if (brandSettings.addCinematicBars) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
                    ctx.fillRect(0, 0, canvas.width, 60);
                    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
                }

                // Title card at start
                if (videoTitle && originalVideo.currentTime < 3) {
                    const alpha = originalVideo.currentTime < 1 
                        ? originalVideo.currentTime 
                        : Math.max(0, (3 - originalVideo.currentTime) / 1);
                    
                    ctx.globalAlpha = alpha;
                    professionalEffects.renderLowerThird(
                        videoTitle,
                        brandSettings.tagline || '',
                        {},
                        alpha
                    );
                    ctx.globalAlpha = 1;
                }

                // Watermark
                professionalEffects.addWatermark(brandSettings.channelName, 'bottom-right', 0.6);

                // Vignette
                if (brandSettings.addVignette) {
                    const gradient = ctx.createRadialGradient(
                        canvas.width / 2, canvas.height / 2, 0,
                        canvas.width / 2, canvas.height / 2, canvas.height / 2
                    );
                    gradient.addColorStop(0, 'rgba(0,0,0,0)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Film grain
                if (brandSettings.addFilmGrain) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 40) {
                        const noise = (Math.random() - 0.5) * 20;
                        data[i] += noise;
                        data[i + 1] += noise;
                        data[i + 2] += noise;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }

                ctx.restore();

                frameCount++;
                const percent = Math.floor((frameCount / totalFrames) * 70) + 30;
                updateProgress(Math.min(percent, 95), null);

                requestAnimationFrame(renderFrame);
            }

            updateProgress(35, 'Processing video frames...');
            originalVideo.play();
            renderFrame();
        });

        showStatus('✅ Video processed successfully!', 'success');
    } catch (error) {
        showStatus('❌ Error: ' + error.message, 'warning');
        console.error(error);
    } finally {
        processBtn.disabled = false;
        processBtn.textContent = '✨ Auto-Process Full Video';
    }
}

// Setup shorts generator
function setupShortsGenerator() {
    document.getElementById('generateShortsBtn').addEventListener('click', async () => {
        const originalVideo = document.getElementById('originalVideo');
        const count = parseInt(document.getElementById('shortsCount').value);
        const duration = parseInt(document.getElementById('shortsDuration').value);

        const generateBtn = document.getElementById('generateShortsBtn');
        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Generating Shorts...';

        try {
            showStatus('🎬 Finding best moments...', 'info');
            
            const segments = await shortsGenerator.findBestMoments(originalVideo, count, duration);
            
            showStatus(`✨ Generating ${segments.length} shorts...`, 'info');

            const shortsResults = document.getElementById('shortsResults');
            const shortsPreview = document.getElementById('shortsPreview');
            shortsPreview.innerHTML = '';
            shortsResults.style.display = 'block';

            for (let i = 0; i < segments.length; i++) {
                showStatus(`🎬 Processing short ${i + 1}/${segments.length}...`, 'info');

                const blob = await shortsGenerator.generateShort(originalVideo, segments[i], {
                    addCaptions: document.getElementById('shortsAutoCaption').checked,
                    autoCrop: document.getElementById('shortsAutoCrop').checked,
                    addEffects: document.getElementById('shortsAutoEffects').checked,
                    style: 'energetic'
                });

                const shortCard = document.createElement('div');
                shortCard.className = 'short-card';
                
                const video = document.createElement('video');
                video.src = URL.createObjectURL(blob);
                video.controls = true;

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'btn';
                downloadBtn.textContent = `💾 Download Short ${i + 1}`;
                downloadBtn.onclick = () => downloadVideo(blob, `viral_short_${i + 1}`);

                shortCard.appendChild(video);
                shortCard.appendChild(downloadBtn);
                shortsPreview.appendChild(shortCard);
            }

            showStatus('✅ All shorts generated!', 'success');
        } catch (error) {
            showStatus('❌ Error: ' + error.message, 'warning');
            console.error(error);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '🎬 Generate Viral Shorts';
        }
    });
}

// Brand settings
function setupBrandSettings() {
    // Slider updates
    const sliders = ['noiseReduction', 'bassBoost', 'voiceClarity', 'compression'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Value');
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value + '%';
        });
    });

    document.getElementById('saveBrandSettings').addEventListener('click', () => {
        const settings = {
            primaryColor: document.getElementById('primaryColor').value,
            accentColor: document.getElementById('accentColor').value,
            textColor: document.getElementById('textColor').value,
            channelName: document.getElementById('channelName').value,
            brandFont: document.getElementById('brandFont').value,
            tagline: document.getElementById('tagline').value,
            noiseReduction: parseInt(document.getElementById('noiseReduction').value),
            bassBoost: parseInt(document.getElementById('bassBoost').value),
            voiceClarity: parseInt(document.getElementById('voiceClarity').value),
            compression: parseInt(document.getElementById('compression').value),
            addCinematicBars: document.getElementById('addCinematicBars').checked,
            addFilmGrain: document.getElementById('addFilmGrain').checked,
            addVignette: document.getElementById('addVignette').checked,
            autoColorGrade: document.getElementById('autoColorGrade').checked
        };
        
        storage.save('settings', settings);
        showStatus('💾 Settings saved!', 'success');
    });
}

function loadSettings() {
    const defaults = {
        primaryColor: '#6a0dad',
        accentColor: '#ffd700',
        textColor: '#ffffff',
        channelName: 'MagickLibrary',
        brandFont: 'Cinzel',
        tagline: 'Exploring Literary Worlds',
        noiseReduction: 70,
        bassBoost: 30,
        voiceClarity: 80,
        compression: 60,
        addCinematicBars: true,
        addFilmGrain: false,
        addVignette: true,
        autoColorGrade: true
    };

    const settings = storage.load('settings') || defaults;

    Object.keys(settings).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = settings[key];
            } else {
                el.value = settings[key];
            }
            
            if (el.type === 'range') {
                const valueDisplay = document.getElementById(key + 'Value');
                if (valueDisplay) {
                    valueDisplay.textContent = settings[key] + '%';
                }
            }
        }
    });

    return settings;
}

// Asset management
function setupAssetManagement() {
    setupAssetInput('introInput', 'introGallery', 'intros');
    setupAssetInput('outroInput', 'outroGallery', 'outros');
    setupAssetInput('overlayInput', 'overlayGallery', 'overlays');
    setupAssetInput('musicInput', 'musicGallery', 'music');
}

function setupAssetInput(inputId, galleryId, storageKey) {
    const input = document.getElementById(inputId);
    const gallery = document.getElementById(galleryId);
    let assets = storage.load(storageKey) || [];

    function renderGallery() {
        gallery.innerHTML = '';
        assets.forEach((asset, idx) => {
            const item = document.createElement('div');
            item.className = 'asset-item';
            
            if (asset.type.startsWith('video')) {
                item.innerHTML = `
                    <video src="${asset.data}"></video>
                    <button class="remove">×</button>
                `;
            } else if (asset.type.startsWith('image')) {
                item.innerHTML = `
                    <img src="${asset.data}">
                    <button class="remove">×</button>
                `;
            } else {
                item.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(106,13,173,0.2)">
                        🎵 ${asset.name}
                    </div>
                    <button class="remove">×</button>
                `;
            }

            item.querySelector('.remove').addEventListener('click', () => {
                assets.splice(idx, 1);
                storage.save(storageKey, assets);
                renderGallery();
            });

            gallery.appendChild(item);
        });
    }

    input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                assets.push({
                    name: file.name,
                    type: file.type,
                    data: event.target.result
                });
                storage.save(storageKey, assets);
                renderGallery();
            };
            reader.readAsDataURL(file);
        }
    });

    renderGallery();
}

// Audio visualization
function setupAudioVisualization() {
    const originalVideo = document.getElementById('originalVideo');
    const previewVideo = document.getElementById('previewVideo');
    const originalCanvas = document.getElementById('audioVizOriginal');
    const previewCanvas = document.getElementById('audioVizPreview');

    // Only set up once per video
    originalVideo.addEventListener('play', () => {
        if (audioProcessor && !originalVideo._audioVizSetup) {
            originalVideo._audioVizSetup = true;
            try {
                audioProcessor.visualizeAudio(originalVideo, originalCanvas);
            } catch (err) {
                console.warn('Audio visualization failed:', err.message);
            }
        }
    }, { once: true });

    previewVideo.addEventListener('play', () => {
        if (audioProcessor && !previewVideo._audioVizSetup) {
            previewVideo._audioVizSetup = true;
            try {
                audioProcessor.visualizeAudio(previewVideo, previewCanvas);
            } catch (err) {
                console.warn('Audio visualization failed:', err.message);
            }
        }
    }, { once: true });
}

// Utility functions
function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    if (type !== 'info') {
        setTimeout(() => statusEl.style.display = 'none', 5000);
    }
}

function updateProgress(percent, step) {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const processingSteps = document.getElementById('processingSteps');
    
    progressContainer.style.display = 'block';
    progressFill.style.width = percent + '%';
    progressFill.textContent = percent + '%';
    
    if (step) {
        processingSteps.innerHTML += `<div>✓ ${step}</div>`;
    }
}

function downloadVideo(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
}
