// SomaSense Admin Panel
// Manages configuration, content, and analytics

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { TERRAIN_QUESTIONS, ARCHETYPE_MAP, SCORING_CONFIG } from './terrain-data.js';
import { ARCHETYPE_CONTENT } from './archetype-content.js';
import { AFFECTS, CHRONICITY_OPTIONS, INTENSITY_LEVELS, ACTION_IMPULSES } from './checkin-data.js';

// ===== INITIALIZATION =====

function init() {
  console.log('🔧 Admin panel initializing...');

  setupNavigation();
  loadTerrainConfig();
  loadArchetypeContent();
  loadCheckinConfig();
  loadAIPrompts();
  loadUserData();
  loadScreenContent();

  console.log('✅ Admin panel ready');
}

// ===== NAVIGATION =====

function setupNavigation() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  const panels = document.querySelectorAll('.admin-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.dataset.panel;

      // Update active states
      navItems.forEach(n => n.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(panelId).classList.add('active');

      console.log('📱 Switched to panel:', panelId);
    });
  });
}

// ===== PANEL 1: TERRAIN CONFIGURATION =====

function loadTerrainConfig() {
  const container = document.getElementById('terrain-config-content');

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Terrain Questions (${TERRAIN_QUESTIONS.length})</div>
      <p style="color: var(--gray-500); margin-bottom: 16px;">
        Currently editing questions is not yet implemented. Questions are defined in terrain-data.js
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Options</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${TERRAIN_QUESTIONS.map((q, i) => `
            <tr>
              <td style="max-width: 400px;">${q.text}</td>
              <td>${q.options.length} options</td>
              <td><button class="btn btn-secondary" style="padding: 8px 16px; font-size: 12px;" disabled>Edit</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Scoring Configuration</div>
      <div class="form-group">
        <label class="form-label">First Choice Weight</label>
        <input type="number" class="form-input" value="${SCORING_CONFIG.firstChoiceWeight}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Second Choice Weight</label>
        <input type="number" class="form-input" value="${SCORING_CONFIG.secondChoiceWeight}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Disorganized Oscillation Threshold</label>
        <input type="number" class="form-input" value="${SCORING_CONFIG.disorganizedOscillationThreshold}" disabled>
      </div>
      <p style="color: var(--gray-500); margin-top: 16px;">
        Scoring configuration is currently read-only and defined in terrain-data.js
      </p>
    </div>

    <div class="card">
      <div class="card-title">Override Priority Order (CRITICAL LOGIC)</div>
      <p style="color: var(--gray-400); margin-bottom: 16px;">
        Overrides are checked in this exact order. Once triggered, subsequent checks are skipped.
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">Priority</th>
            <th>Override</th>
            <th>Trigger Condition</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: rgba(239, 68, 68, 0.1);">
            <td><strong style="color: #ef4444;">FIRST</strong></td>
            <td><strong>Disorganized Override</strong><br><small style="color: var(--gray-500);">Hidden Fragmentation</small></td>
            <td>User oscillates Anxious/Avoidant on <strong>3+</strong> questions<br><small style="color: var(--gray-500);">(1st=Anxious + 2nd=Avoidant OR reverse)</small></td>
            <td>Assign <strong>Mystery Mosaic (MM)</strong><br>Flags: <code style="font-size: 11px;">hidden_disorganized, masked_fragmentation</code></td>
          </tr>
          <tr style="background: rgba(34, 197, 94, 0.1);">
            <td><strong style="color: #22c55e;">SECOND</strong></td>
            <td><strong>Secure-First Override</strong><br><small style="color: var(--gray-500);">Aspirational Bias Detection</small></td>
            <td>User selects Secure as 1st choice on <strong>6+</strong> questions</td>
            <td>
              <strong>If</strong> secondary pattern (4+ 2nd choices):<br>
              → Assign that terrain + Secure secondary<br>
              <strong>Else</strong>:<br>
              → Trigger probing question<br>
              Flags: <code style="font-size: 11px;">regulated_presentation, confirmed_secure: false</code>
            </td>
          </tr>
          <tr style="background: rgba(59, 130, 246, 0.1);">
            <td><strong style="color: #3b82f6;">THIRD</strong></td>
            <td><strong>Tiebreaker</strong></td>
            <td>Multiple categories have equal highest score</td>
            <td>Use priority: <strong>Disorganized</strong> &gt; <strong>Anxious</strong> &gt; <strong>Avoidant</strong> &gt; <strong>Secure</strong></td>
          </tr>
          <tr>
            <td><strong style="color: var(--gray-400);">FALLBACK</strong></td>
            <td><strong>Standard Scoring</strong></td>
            <td>No overrides triggered</td>
            <td>Primary = highest score<br>Secondary = 2nd highest score</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6;">
        <strong style="color: #3b82f6;">⚠️ IMPLEMENTATION NOTE:</strong><br>
        <span style="color: var(--gray-300); font-size: 14px;">
          The current implementation checks <strong>Disorganized FIRST</strong>, then <strong>Secure-First SECOND</strong>.
          This differs from some older documentation which specified the reverse order.
          The current order is clinically preferred because disorganized oscillation is a more objective behavioral marker
          and should take absolute priority regardless of secure selections.
        </span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Archetype Mapping</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Primary + Secondary</th>
            <th>Archetype</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(ARCHETYPE_MAP).map(([combo, code]) => `
            <tr>
              <td>${combo}</td>
              <td>${code} (${ARCHETYPE_CONTENT[code]?.displayName || 'Unknown'})</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ===== PANEL 2: ARCHETYPE CONTENT =====

function loadArchetypeContent() {
  const container = document.getElementById('archetype-content-data');

  const archetypes = Object.entries(ARCHETYPE_CONTENT);

  container.innerHTML = `
    <div class="alert alert-info">
      Archetype content is currently read-only and defined in archetype-content.js.
      Future versions will allow editing via Firestore.
    </div>

    ${archetypes.map(([code, content]) => `
      <div class="card">
        <div class="card-title">${code}: ${content.displayName}</div>

        <div class="form-group">
          <label class="form-label">Primary Terrain</label>
          <input type="text" class="form-input" value="${content.primaryTerrain}" disabled>
        </div>

        <div class="form-group">
          <label class="form-label">Core Recognition</label>
          <textarea class="form-textarea" disabled>${content.coreRecognition}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Protective Logic</label>
          <textarea class="form-textarea" disabled>${content.protectiveLogic}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Cost Under Stress</label>
          <textarea class="form-textarea" disabled>${content.costUnderStress}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Repulsion/Disavowal</label>
          <textarea class="form-textarea" disabled>${content.repulsionDisavowal}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Opening Questions (${content.openingQuestions.length})</label>
          <ul style="list-style: none; padding: 0; margin-top: 8px;">
            ${content.openingQuestions.map(q => `
              <li style="padding: 8px; background: var(--black); margin-bottom: 4px;">${q}</li>
            `).join('')}
          </ul>
        </div>
      </div>
    `).join('')}
  `;
}

// ===== PANEL 3: CHECK-IN CONFIGURATION =====

function loadCheckinConfig() {
  const container = document.getElementById('checkin-config-content');

  container.innerHTML = `
    <div class="alert alert-info">
      Check-In configuration is currently read-only and defined in checkin-data.js.
      Future versions will allow editing via Firestore.
    </div>

    <div class="card">
      <div class="card-title">Affects (${AFFECTS.length})</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${AFFECTS.map(affect => `
            <tr>
              <td style="font-size: 24px;">${affect.icon}</td>
              <td>${affect.id}</td>
              <td>${affect.name}</td>
              <td style="max-width: 300px;">${affect.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Chronicity Options (${CHRONICITY_OPTIONS.length})</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${CHRONICITY_OPTIONS.map(opt => `
            <tr>
              <td>${opt.id}</td>
              <td>${opt.label}</td>
              <td>${opt.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Intensity Levels (${INTENSITY_LEVELS.length})</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Label</th>
            <th>Description</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${INTENSITY_LEVELS.map(level => `
            <tr>
              <td>${level.id}</td>
              <td>${level.label}</td>
              <td>${level.description}</td>
              <td>${level.value}/10</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Action Impulses (${ACTION_IMPULSES.length})</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>ID</th>
            <th>Label</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${ACTION_IMPULSES.map(impulse => `
            <tr>
              <td style="font-size: 24px;">${impulse.icon}</td>
              <td>${impulse.id}</td>
              <td>${impulse.label}</td>
              <td style="max-width: 300px;">${impulse.description}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ===== PANEL 4: AI PROMPTS =====

function loadAIPrompts() {
  const container = document.getElementById('ai-prompts-content');

  container.innerHTML = `
    <div class="alert alert-info">
      AI prompts are currently defined in Cloud Functions (functions/src/index.ts).
      Future versions will allow editing system prompts via Firestore.
    </div>

    <div class="card">
      <div class="card-title">Prompt Configuration</div>
      <p style="color: var(--gray-500); margin-bottom: 16px;">
        Current implementation uses a 2-pass system:
      </p>
      <ol style="color: var(--gray-400); margin-left: 20px; line-height: 1.8;">
        <li><strong>Pass 1:</strong> Generate therapeutic response based on Check-In data and archetype</li>
        <li><strong>Pass 2:</strong> Enhance and simplify readout (9th grade reading level, apply guardrails)</li>
      </ol>
    </div>

    <div class="card">
      <div class="card-title">Linguistic Guardrails</div>
      <p style="color: var(--gray-500); margin-bottom: 16px;">
        Enforced transformation rules:
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>NEVER</th>
            <th>INSTEAD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>"You should..."</td>
            <td>"What would it be like if..."</td>
          </tr>
          <tr>
            <td>"Try this..."</td>
            <td>"What does your body need?"</td>
          </tr>
          <tr>
            <td>"You have anxious attachment"</td>
            <td>"You lead with reaching"</td>
          </tr>
          <tr>
            <td>"This is unhealthy"</td>
            <td>"This is costing you"</td>
          </tr>
          <tr>
            <td>"You need to..."</td>
            <td>"What would it take to..."</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-title">Model Configuration</div>
      <div class="form-group">
        <label class="form-label">Model</label>
        <input type="text" class="form-input" value="gemini-2.5-flash" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Temperature</label>
        <input type="number" step="0.1" class="form-input" value="0.7" disabled>
      </div>
      <p style="color: var(--gray-500);">Model configuration is managed in Cloud Functions</p>
    </div>
  `;
}

// ===== PANEL 5: USER DATA & ANALYTICS =====

async function loadUserData() {
  const db = window.firebaseDb;

  try {
    // Get check-ins for statistics
    const checkInsRef = collection(db, 'checkIns');
    const checkInsQuery = query(checkInsRef, orderBy('timestamp', 'desc'), limit(100));
    const checkInsSnapshot = await getDocs(checkInsQuery);

    const checkIns = [];
    checkInsSnapshot.forEach(doc => {
      checkIns.push({ id: doc.id, ...doc.data() });
    });

    // Calculate stats
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const checkIns24h = checkIns.filter(c => c.timestamp?.toMillis() > oneDayAgo);

    const totalIntensity = checkIns.reduce((sum, c) => sum + (c.intensity || 0), 0);
    const avgIntensity = checkIns.length > 0 ? (totalIntensity / checkIns.length).toFixed(1) : 0;

    // Update stats
    document.getElementById('stat-total-users').textContent = '—'; // Would need to query userTerrains
    document.getElementById('stat-total-checkins').textContent = checkIns.length;
    document.getElementById('stat-checkins-24h').textContent = checkIns24h.length;
    document.getElementById('stat-avg-intensity').textContent = avgIntensity;

    // Render table
    const tableContainer = document.getElementById('user-data-table');
    if (checkIns.length === 0) {
      tableContainer.innerHTML = '<p style="color: var(--gray-500); padding: 20px; text-align: center;">No check-ins yet</p>';
      return;
    }

    tableContainer.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Affect</th>
            <th>Archetype</th>
            <th>Intensity</th>
            <th>Chronicity</th>
            <th>Crisis</th>
          </tr>
        </thead>
        <tbody>
          ${checkIns.slice(0, 50).map(c => `
            <tr>
              <td>${c.timestamp ? new Date(c.timestamp.toMillis()).toLocaleString() : 'N/A'}</td>
              <td>${c.affect || 'N/A'}</td>
              <td>${c.archetype || 'N/A'}</td>
              <td>${c.intensity || 'N/A'}</td>
              <td>${c.chronicity || 'N/A'}</td>
              <td>${c.safetyFlags?.crisisDetected ? `<span style="color: var(--red);">${c.safetyFlags.crisisLevel}</span>` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    console.error('❌ Error loading user data:', error);
    document.getElementById('user-data-table').innerHTML = `
      <p style="color: var(--red); padding: 20px;">Error loading data: ${error.message}</p>
    `;
  }
}

// ===== PANEL 6: SCREEN CONTENT =====

async function loadScreenContent() {
  const container = document.getElementById('screen-content-data');

  try {
    // Load welcome config from Firestore or use defaults
    const { loadWelcomeConfig, saveWelcomeConfig, DEFAULT_WELCOME_CONFIG } = await import('./welcome-config.js');
    const config = await loadWelcomeConfig();

    container.innerHTML = `
      <div class="alert alert-success">
        <strong>Welcome Screen Configuration</strong><br>
        Edit text, gradient colors, and visual effects. Changes apply immediately after saving.
      </div>

      <div class="card">
        <div class="card-title">Text Content</div>
        <div class="form-group">
          <label class="form-label">Block 1: Headline</label>
          <input type="text" class="form-input" id="welcome-text-1" value="${config.text.block1}">
        </div>
        <div class="form-group">
          <label class="form-label">Block 2: Value Proposition</label>
          <textarea class="form-textarea" id="welcome-text-2" rows="3">${config.text.block2}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Block 3: Description (with color blur)</label>
          <textarea class="form-textarea" id="welcome-text-3" rows="3">${config.text.block3}</textarea>
        </div>
      </div>

      <div class="card">
        <div class="card-title">WebGL Gradient Background</div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="gradient-enabled" ${config.gradient.enabled ? 'checked' : ''}>
            Enable animated gradient
          </label>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Color 1</label>
            <input type="color" class="form-input" id="gradient-color1" value="${config.gradient.color1}">
          </div>
          <div class="form-group">
            <label class="form-label">Color 2</label>
            <input type="color" class="form-input" id="gradient-color2" value="${config.gradient.color2}">
          </div>
          <div class="form-group">
            <label class="form-label">Color 3</label>
            <input type="color" class="form-input" id="gradient-color3" value="${config.gradient.color3}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Animation Speed</label>
            <input type="number" class="form-input" id="gradient-speed" value="${config.gradient.speed}" step="0.0001" min="0" max="0.01">
            <small class="form-help">Recommended: 0.0005</small>
          </div>
          <div class="form-group">
            <label class="form-label">Intensity</label>
            <input type="number" class="form-input" id="gradient-intensity" value="${config.gradient.intensity}" step="0.1" min="0" max="1">
            <small class="form-help">Recommended: 0.3</small>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Color Blur Effect (Block 3)</div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="blur-enabled" ${config.colorBlur.enabled ? 'checked' : ''}>
            Enable color blur behind Block 3
          </label>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Blur Color</label>
            <input type="text" class="form-input" id="blur-color" value="${config.colorBlur.color}">
            <small class="form-help">Use rgba() format</small>
          </div>
          <div class="form-group">
            <label class="form-label">Blur Size</label>
            <input type="text" class="form-input" id="blur-size" value="${config.colorBlur.size}">
          </div>
          <div class="form-group">
            <label class="form-label">Blur Amount</label>
            <input type="text" class="form-input" id="blur-amount" value="${config.colorBlur.blur}">
          </div>
          <div class="form-group">
            <label class="form-label">Opacity</label>
            <input type="number" class="form-input" id="blur-opacity" value="${config.colorBlur.opacity}" step="0.1" min="0" max="1">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Privacy Statement</div>
        <div class="form-group">
          <label class="form-label">Link Text</label>
          <input type="text" class="form-input" id="privacy-statement" value="${config.privacyStatement}">
        </div>
        <div class="form-group">
          <label class="form-label">Link URL</label>
          <input type="text" class="form-input" id="privacy-url" value="${config.privacyUrl}">
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" id="save-welcome-config">Save Welcome Config</button>
        <button class="btn btn-secondary" id="reset-welcome-config">Reset to Defaults</button>
      </div>
    `;

    // Add save button handler
    document.getElementById('save-welcome-config').addEventListener('click', async () => {
      const newConfig = {
        text: {
          block1: document.getElementById('welcome-text-1').value,
          block2: document.getElementById('welcome-text-2').value,
          block3: document.getElementById('welcome-text-3').value
        },
        gradient: {
          enabled: document.getElementById('gradient-enabled').checked,
          color1: document.getElementById('gradient-color1').value,
          color2: document.getElementById('gradient-color2').value,
          color3: document.getElementById('gradient-color3').value,
          speed: parseFloat(document.getElementById('gradient-speed').value),
          intensity: parseFloat(document.getElementById('gradient-intensity').value)
        },
        colorBlur: {
          enabled: document.getElementById('blur-enabled').checked,
          color: document.getElementById('blur-color').value,
          size: document.getElementById('blur-size').value,
          blur: document.getElementById('blur-amount').value,
          opacity: parseFloat(document.getElementById('blur-opacity').value)
        },
        privacyStatement: document.getElementById('privacy-statement').value,
        privacyUrl: document.getElementById('privacy-url').value
      };

      const result = await saveWelcomeConfig(newConfig);
      if (result.success) {
        alert('✅ Welcome config saved! Changes will apply on next page load.');
      } else {
        alert('❌ Failed to save: ' + result.error);
      }
    });

    // Add reset button handler
    document.getElementById('reset-welcome-config').addEventListener('click', async () => {
      if (confirm('Reset all welcome screen settings to defaults?')) {
        const result = await saveWelcomeConfig(DEFAULT_WELCOME_CONFIG);
        if (result.success) {
          alert('✅ Welcome config reset to defaults!');
          loadScreenContent(); // Reload panel
        } else {
          alert('❌ Failed to reset: ' + result.error);
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to load screen content:', error);
    container.innerHTML = `
      <div class="alert alert-error">
        Failed to load screen content: ${error.message}
      </div>
    `;
  }
}

// ===== INITIALIZATION =====

// Wait for auth and Firebase to be ready
window.addEventListener('load', () => {
  // Small delay to ensure Firebase is initialized
  setTimeout(init, 500);
});
