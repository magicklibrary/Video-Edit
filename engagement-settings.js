/**
 * Engagement Settings Integration
 * Add this to main.js to enable engagement features
 */

// Add to your existing setupUI() function:
function setupEngagementFeatures() {
    const engagementBooster = new EngagementBooster(document.createElement('canvas'));
    
    // Add engagement settings to the settings tab
    const settingsTab = document.getElementById('settings');
    
    // Create engagement card
    const engagementCard = document.createElement('div');
    engagementCard.className = 'card';
    engagementCard.innerHTML = `
        <h3>🎯 Engagement Boosters</h3>
        
        <div class="toggle">
            <input type="checkbox" id="autoRetentionHooks" checked>
            <label>Auto retention hooks (every 10 seconds)</label>
        </div>
        
        <div class="toggle">
            <input type="checkbox" id="autoChapterMarkers" checked>
            <label>Auto chapter markers</label>
        </div>
        
        <div class="toggle">
            <input type="checkbox" id="mysticalParticles" checked>
            <label>Mystical particle effects</label>
        </div>
        
        <div class="toggle">
            <input type="checkbox" id="emphasisZoom">
            <label>Zoom on key moments</label>
        </div>
        
        <div class="toggle">
            <input type="checkbox" id="patternInterrupts">
            <label>Pattern interrupts (attention resets)</label>
        </div>
        
        <div class="toggle">
            <input type="checkbox" id="brollOverlays">
            <label>B-roll image overlays</label>
        </div>
        
        <label>Chapter Marker Style:</label>
        <select id="chapterStyle">
            <option value="mystical">Mystical / Esoteric</option>
            <option value="academic">Academic / Professional</option>
            <option value="dramatic">Dramatic / Intense</option>
            <option value="minimal">Minimal / Clean</option>
        </select>
        
        <label>Retention Hook Frequency (seconds):</label>
        <input type="number" id="hookInterval" value="10" min="5" max="30">
        
        <label>Pattern Interrupt Type:</label>
        <select id="interruptType">
            <option value="flash">Flash</option>
            <option value="shake">Shake</option>
            <option value="zoom_pulse">Zoom Pulse</option>
            <option value="color_shift">Color Shift</option>
        </select>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
        
        <h4 style="color: #ffd700; margin-bottom: 15px;">📝 Custom Quotes & Key Points</h4>
        <p style="opacity: 0.8; font-size: 14px; margin-bottom: 10px;">
            Add timestamped quotes that will appear during your video
        </p>
        
        <div id="quotesContainer" style="margin-bottom: 15px;">
            <!-- Quotes will be added here -->
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <input type="number" id="quoteTimestamp" placeholder="Time (seconds)" min="0">
            <input type="text" id="quoteText" placeholder="Quote text">
        </div>
        <input type="text" id="quoteAuthor" placeholder="Author (optional)" style="margin-top: 10px;">
        <button class="btn" id="addQuoteBtn" style="margin-top: 10px; width: 100%;">
            ➕ Add Quote Overlay
        </button>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
        
        <h4 style="color: #ffd700; margin-bottom: 15px;">🖼️ B-Roll Images</h4>
        <p style="opacity: 0.8; font-size: 14px; margin-bottom: 10px;">
            Upload book covers, author photos, relevant imagery
        </p>
        
        <select id="brollMode">
            <option value="corner">Corner overlay</option>
            <option value="split">Split screen</option>
            <option value="fullscreen">Full screen (semi-transparent)</option>
        </select>
        
        <input type="file" id="brollUpload" accept="image/*" multiple style="margin-top: 10px;">
        <div id="brollGallery" class="asset-gallery" style="margin-top: 15px;"></div>
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
        
        <h4 style="color: #ffd700; margin-bottom: 15px;">📊 Key Points (Rule of 3s)</h4>
        <p style="opacity: 0.8; font-size: 14px; margin-bottom: 10px;">
            Present information in digestible groups of 3
        </p>
        
        <textarea id="keyPoints" placeholder="Enter 3 key points, one per line" rows="4"></textarea>
        <button class="btn" id="generateKeyPointsBtn" style="margin-top: 10px; width: 100%;">
            🎯 Generate Key Points Overlay
        </button>
    `;
    
    // Insert after audio settings card
    const audioCard = document.querySelector('#settings .grid');
    if (audioCard) {
        audioCard.appendChild(engagementCard);
    }
    
    // Setup event listeners
    setupQuoteManager();
    setupBrollManager();
    setupKeyPointsManager();
    
    return engagementBooster;
}

function setupQuoteManager() {
    const quotes = [];
    const addBtn = document.getElementById('addQuoteBtn');
    const container = document.getElementById('quotesContainer');
    
    if (!addBtn) return;
    
    addBtn.addEventListener('click', () => {
        const timestamp = parseFloat(document.getElementById('quoteTimestamp').value);
        const text = document.getElementById('quoteText').value;
        const author = document.getElementById('quoteAuthor').value;
        
        if (!timestamp || !text) {
            alert('Please enter timestamp and quote text');
            return;
        }
        
        quotes.push({ timestamp, text, author });
        
        // Add to display
        const quoteEl = document.createElement('div');
        quoteEl.style.cssText = 'background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px;';
        quoteEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <strong style="color: #ffd700;">${timestamp}s:</strong> ${text}
                    ${author ? `<br><em style="opacity: 0.7;">— ${author}</em>` : ''}
                </div>
                <button class="remove" style="background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 25px; height: 25px; cursor: pointer;">×</button>
            </div>
        `;
        
        quoteEl.querySelector('.remove').addEventListener('click', () => {
            const index = quotes.findIndex(q => q.timestamp === timestamp && q.text === text);
            quotes.splice(index, 1);
            quoteEl.remove();
        });
        
        container.appendChild(quoteEl);
        
        // Clear inputs
        document.getElementById('quoteTimestamp').value = '';
        document.getElementById('quoteText').value = '';
        document.getElementById('quoteAuthor').value = '';
        
        // Save to storage
        storage.save('engagement_quotes', quotes);
    });
    
    // Load saved quotes
    const savedQuotes = storage.load('engagement_quotes');
    if (savedQuotes) {
        savedQuotes.forEach(q => {
            // Restore UI (simplified)
            quotes.push(q);
        });
    }
}

function setupBrollManager() {
    const brollImages = [];
    const upload = document.getElementById('brollUpload');
    const gallery = document.getElementById('brollGallery');
    const modeSelect = document.getElementById('brollMode');
    
    if (!upload) return;
    
    upload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    brollImages.push({
                        data: event.target.result,
                        image: img,
                        mode: modeSelect.value,
                        name: file.name
                    });
                    
                    // Add to gallery
                    const item = document.createElement('div');
                    item.className = 'asset-item';
                    item.innerHTML = `
                        <img src="${event.target.result}">
                        <button class="remove">×</button>
                    `;
                    
                    item.querySelector('.remove').addEventListener('click', () => {
                        const index = brollImages.findIndex(b => b.data === event.target.result);
                        brollImages.splice(index, 1);
                        item.remove();
                        storage.save('engagement_broll', brollImages.map(b => ({ data: b.data, mode: b.mode, name: b.name })));
                    });
                    
                    gallery.appendChild(item);
                    
                    // Save
                    storage.save('engagement_broll', brollImages.map(b => ({ data: b.data, mode: b.mode, name: b.name })));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Load saved
    const savedBroll = storage.load('engagement_broll');
    if (savedBroll) {
        savedBroll.forEach(b => {
            const img = new Image();
            img.onload = () => {
                brollImages.push({ data: b.data, image: img, mode: b.mode, name: b.name });
            };
            img.src = b.data;
        });
    }
    
    // Return for use in processing
    window.engagementBrollImages = brollImages;
}

function setupKeyPointsManager() {
    const btn = document.getElementById('generateKeyPointsBtn');
    
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        const text = document.getElementById('keyPoints').value;
        const points = text.split('\n').filter(p => p.trim());
        
        if (points.length === 0) {
            alert('Please enter at least one key point');
            return;
        }
        
        if (points.length > 5) {
            alert('Maximum 5 key points for best engagement');
            return;
        }
        
        storage.save('engagement_keypoints', points);
        alert(`✅ ${points.length} key points saved! They'll appear in your video.`);
    });
}

// Modified processFullVideo to include engagement features
function processVideoWithEngagement(originalVideo, canvas, engagementBooster) {
    const settings = {
        autoRetentionHooks: document.getElementById('autoRetentionHooks')?.checked || false,
        autoChapterMarkers: document.getElementById('autoChapterMarkers')?.checked || false,
        mysticalParticles: document.getElementById('mysticalParticles')?.checked || false,
        emphasisZoom: document.getElementById('emphasisZoom')?.checked || false,
        patternInterrupts: document.getElementById('patternInterrupts')?.checked || false,
        brollOverlays: document.getElementById('brollOverlays')?.checked || false,
        hookInterval: parseInt(document.getElementById('hookInterval')?.value || 10),
        interruptType: document.getElementById('interruptType')?.value || 'flash'
    };
    
    // Generate engagement elements
    if (settings.autoRetentionHooks) {
        engagementBooster.generateRetentionHooks(originalVideo.duration, settings.hookInterval);
    }
    
    if (settings.autoChapterMarkers) {
        const chapterCount = Math.min(5, Math.floor(originalVideo.duration / 60));
        engagementBooster.generateChapterMarkers(originalVideo.duration, chapterCount);
    }
    
    // Load custom quotes
    const savedQuotes = storage.load('engagement_quotes') || [];
    savedQuotes.forEach(q => {
        engagementBooster.addTimestampedQuote(q.timestamp, q.text, q.author);
    });
    
    // Load B-roll
    if (settings.brollOverlays && window.engagementBrollImages) {
        engagementBooster.loadBrollAssets(window.engagementBrollImages);
    }
    
    return settings;
}

// Export setup function
window.setupEngagementFeatures = setupEngagementFeatures;
window.processVideoWithEngagement = processVideoWithEngagement;
