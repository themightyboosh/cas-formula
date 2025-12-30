// SomaSense Main Application
// State management, navigation, and Terrain assessment flow

import { TERRAIN_QUESTIONS, PROBING_QUESTION, SCORING_CONFIG } from './terrain-data.js';
import { calculateTerrain, needsProbingQuestion, randomizeQuestionOptions } from './terrain-scoring.js';
import { getArchetypeContent } from './archetype-content.js';
import { WebGLGradient } from './webgl-gradient.js';
import { loadWelcomeConfig, applyWelcomeConfig } from './welcome-config.js';
import { loadFirstCheckinConfig, getWelcomeMessage } from './first-checkin-welcome-config.js';
import {
  AFFECTS,
  RELATIONAL_DIRECTIONS,
  CHRONICITY_OPTIONS,
  INTENSITY_LEVELS,
  ACTION_IMPULSES,
  getMetabolicState,
  getAffectById,
  getIntensityValue
} from './checkin-data.js';
import {
  initAuth,
  AuthState,
  signInWithGoogle,
  cacheTerrainData,
  getCachedTerrainData,
  saveTerrainToFirestore,
  loadTerrainFromFirestore,
  saveCheckInToFirestore,
  isUserGuest,
  deleteAllUserDataFromFirestore
} from './auth.js';

// ===== APPLICATION STATE =====
const AppState = {
  // User data
  userId: null,
  isGuest: true,

  // Terrain assessment
  terrainQuestions: [],  // Randomized copy of TERRAIN_QUESTIONS (set at assessment start)
  terrainAnswers: {},  // { q1: { first: 'A', second: 'B', least: 'C' }, ... }
  currentQuestion: 0,
  selectionStage: 1,  // 1 = first choice, 2 = second choice, 3 = least choice
  availableOptions: [],  // Options remaining for current stage
  terrainProfile: null,  // Calculated terrain result

  // Check-in data
  currentCheckIn: {},
  pendingAffectSelection: null,  // Stores affect ID when signup prompt interrupts check-in flow

  // UI state
  currentScreen: 'welcome',
  previousScreen: null,

  // WebGL gradient instance
  welcomeGradient: null,
};

// ===== INITIALIZATION =====
function init() {
  console.log('🌿 SomaSense initializing...');

  // WebGL gradient removed - using static CSS radial gradient instead
  // initWelcomeGradient();

  // Initialize Firebase Auth
  initAuth(async (authState) => {
    console.log('✅ Auth ready:', authState.isGuest ? 'Guest user' : 'Signed-in user');

    // Update AppState with auth info
    AppState.userId = authState.user?.uid;
    AppState.isGuest = authState.isGuest;

    // Load existing terrain from Firestore or localStorage
    await loadExistingTerrain();
  });

  // Set up event listeners
  setupEventListeners();

  // Initialize hamburger menu
  initializeMenu();

  console.log('✅ SomaSense initializing (waiting for auth)...');
}

// Initialize WebGL gradient background
async function initWelcomeGradient() {
  const canvas = document.getElementById('welcome-gradient-canvas');
  if (!canvas) {
    console.warn('⚠️ Welcome gradient canvas not found');
    return;
  }

  try {
    // Load configuration from Firestore or use defaults
    const welcomeConfig = await loadWelcomeConfig();

    // Apply text and style configuration
    applyWelcomeConfig(welcomeConfig);

    // Initialize WebGL gradient if enabled
    if (welcomeConfig.gradient.enabled) {
      AppState.welcomeGradient = new WebGLGradient(canvas, welcomeConfig.gradient);
      console.log('✅ WebGL gradient initialized');
    } else {
      console.log('ℹ️ WebGL gradient disabled in config');
    }
  } catch (error) {
    console.error('❌ WebGL gradient failed:', error);
  }
}

// Load existing terrain from Firestore or localStorage
async function loadExistingTerrain() {
  // For signed-in users: ONLY use Firestore (source of truth)
  if (!AppState.isGuest) {
    const firestoreTerrain = await loadTerrainFromFirestore();
    if (firestoreTerrain) {
      AppState.terrainProfile = firestoreTerrain;
      localStorage.setItem('somasense_terrain', JSON.stringify(firestoreTerrain));
      console.log('✅ Terrain loaded from Firestore:', firestoreTerrain.archetype);
    } else {
      // Signed in but no Firestore terrain - clear any stale localStorage
      console.log('ℹ️ Signed-in user with no Firestore terrain - clearing localStorage cache');
      localStorage.removeItem('somasense_terrain');
      localStorage.removeItem('somasense_last_used');
      AppState.terrainProfile = null;
    }
  } else {
    // Guest users: check localStorage only
    const cachedTerrain = localStorage.getItem('somasense_terrain');
    if (cachedTerrain) {
      try {
        AppState.terrainProfile = JSON.parse(cachedTerrain);
        console.log('✅ Terrain loaded from cache (guest):', AppState.terrainProfile.archetype);
      } catch (error) {
        console.error('❌ Error parsing cached terrain:', error);
        localStorage.removeItem('somasense_terrain');
      }
    }
  }

  // Determine initial screen
  if (AppState.terrainProfile) {
    // Check if terrain is stale (24h gate)
    const lastUsed = localStorage.getItem('somasense_last_used');
    const now = Date.now();
    if (lastUsed && now - parseInt(lastUsed) > 24 * 60 * 60 * 1000) {
      showScreen('terrain-gate');
    } else {
      showScreen('daily-welcome');
    }
  } else {
    // First-time user or signed-in user with no terrain
    showScreen('welcome');
  }

  console.log('✅ SomaSense ready');
}

// ===== SCREEN NAVIGATION =====
function showScreen(screenId) {
  console.log(`📱 Navigating: ${AppState.currentScreen} → ${screenId}`);

  // 🔒 CRITICAL GUARD: Check-in flow screens require terrain data
  const checkInFlowScreens = [
    'daily-welcome',
    'affect-selection',
    'relational-direction',
    'chronicity-selection',
    'intensity-selection',
    'action-impulse',
    'results'
  ];

  if (checkInFlowScreens.includes(screenId) && !AppState.terrainProfile) {
    console.error(`❌ TERRAIN GUARD: Screen "${screenId}" requires terrain - redirecting to onboarding`);
    screenId = 'onboarding-intro'; // Override navigation to prevent broken flow
  }

  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    AppState.previousScreen = AppState.currentScreen;
    AppState.currentScreen = screenId;

    // WebGL gradient removed - static CSS gradient used instead
    // const gradientCanvas = document.getElementById('welcome-gradient-canvas');
    // if (gradientCanvas) {
    //   gradientCanvas.style.display = screenId === 'welcome' ? 'block' : 'none';
    // }

    // Show/hide global header based on screen
    const globalHeader = document.getElementById('global-header');
    // Header should be hidden on: welcome, terrain-gate, onboarding-intro, terrain-questions, terrain-reveal, crisis-resources
    // Header SHOULD show on: daily-welcome, affect-selection, relational-direction, chronicity-selection, intensity-selection, action-impulse, results
    const screensWithoutHeader = ['welcome', 'terrain-gate', 'onboarding-intro', 'terrain-questions', 'terrain-reveal', 'crisis-resources'];
    if (globalHeader) {
      if (screensWithoutHeader.includes(screenId) || screenId.startsWith('terrain-question-')) {
        globalHeader.style.display = 'none';
      } else {
        globalHeader.style.display = 'flex';
        // Update header content (username + check-in count) when showing it
        updateGlobalHeader();
      }
    }

    // Run screen-specific initialization
    initializeScreen(screenId);
  } else {
    console.error(`❌ Screen not found: ${screenId}`);
  }
}

function initializeScreen(screenId) {
  switch (screenId) {
    case 'welcome':
      // Update privacy statement link if needed
      break;

    case 'terrain-gate':
      populateTerrainGate();
      break;

    case 'onboarding-intro':
      // Static content, no initialization needed
      break;

    case 'terrain-questions':
      startTerrainAssessment();
      break;

    case 'terrain-reveal':
      populateTerrainReveal();
      break;

    case 'daily-welcome':
      populateDailyWelcome();
      break;

    case 'affect-selection':
      renderAffectSelection();
      break;

    case 'relational-direction':
      renderRelationalDirection();
      break;

    case 'chronicity-selection':
      renderChronicitySelection();
      break;

    case 'intensity-selection':
      renderIntensitySelection();
      break;

    case 'action-impulse':
      renderActionImpulse();
      break;

    case 'results':
      populateResults();
      break;

    case 'crisis-resources':
      populateCrisisResources();
      break;

    default:
      console.log(`ℹ️ No initialization needed for ${screenId}`);
  }
}

// ===== TERRAIN ASSESSMENT LOGIC =====

function startTerrainAssessment() {
  // Reset assessment state
  AppState.terrainAnswers = {};
  AppState.currentQuestion = 0;
  AppState.selectionStage = 1;

  // Randomize question options to prevent pattern guessing
  // Each user gets a different shuffle of A/B/C/D options
  AppState.terrainQuestions = randomizeQuestionOptions(TERRAIN_QUESTIONS);
  console.log('✅ Question options randomized for assessment');

  // Render first question
  renderTerrainQuestion();
}

function renderTerrainQuestion() {
  const question = AppState.terrainQuestions[AppState.currentQuestion];

  // Update progress
  const progressText = document.getElementById('terrain-progress-text');
  const progressBar = document.getElementById('terrain-progress-bar');
  if (progressText) {
    progressText.textContent = `Question ${AppState.currentQuestion + 1} of ${AppState.terrainQuestions.length}`;
  }
  if (progressBar) {
    const progress = ((AppState.currentQuestion) / AppState.terrainQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Update question text based on stage
  const questionTextEl = document.getElementById('terrain-question-text');
  let stagePrompt = '';
  switch (AppState.selectionStage) {
    case 1:
      stagePrompt = 'Which is most like you?';
      AppState.availableOptions = [...question.options];  // All 4 options
      break;
    case 2:
      stagePrompt = 'Which is next most like you?';
      // Filter out first choice
      const firstChoice = AppState.terrainAnswers[question.id].first;
      AppState.availableOptions = question.options.filter(opt => opt.id !== firstChoice);
      break;
    case 3:
      stagePrompt = 'Which is least like you?';
      // Filter out first and second choices
      const answers = AppState.terrainAnswers[question.id];
      AppState.availableOptions = question.options.filter(
        opt => opt.id !== answers.first && opt.id !== answers.second
      );
      break;
  }

  if (questionTextEl) {
    questionTextEl.innerHTML = `
      <div class="stage-prompt">${stagePrompt}</div>
      <div class="question-text">${question.text}</div>
    `;
  }

  // Render options
  renderTerrainOptions();

  // Show/hide continue button (disabled until selection made)
  updateContinueButton();
}

function renderTerrainOptions() {
  const optionsGrid = document.getElementById('terrain-options-grid');
  if (!optionsGrid) return;

  // Randomize option order if stage 1
  const options = AppState.selectionStage === 1
    ? shuffleArray([...AppState.availableOptions])
    : AppState.availableOptions;

  optionsGrid.innerHTML = options.map(option => `
    <button
      class="option-card"
      data-option-id="${option.id}"
      onclick="selectTerrainOption('${option.id}')"
    >
      <div class="option-text">${option.text}</div>
    </button>
  `).join('');
}

function selectTerrainOption(optionId) {
  const question = AppState.terrainQuestions[AppState.currentQuestion];

  // Initialize answer object if needed
  if (!AppState.terrainAnswers[question.id]) {
    AppState.terrainAnswers[question.id] = {};
  }

  // Store answer based on stage
  switch (AppState.selectionStage) {
    case 1:
      AppState.terrainAnswers[question.id].first = optionId;
      break;
    case 2:
      AppState.terrainAnswers[question.id].second = optionId;
      break;
    case 3:
      AppState.terrainAnswers[question.id].least = optionId;
      break;
  }

  console.log(`✅ Q${AppState.currentQuestion + 1} Stage ${AppState.selectionStage}:`, optionId);

  // Highlight selected option
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.option-card').classList.add('selected');

  // Enable continue button
  updateContinueButton();
}

function updateContinueButton() {
  const continueBtn = document.getElementById('terrain-continue-btn');
  if (!continueBtn) return;

  const question = AppState.terrainQuestions[AppState.currentQuestion];
  const answer = AppState.terrainAnswers[question.id];

  // Enable button if current stage is answered
  let isAnswered = false;
  switch (AppState.selectionStage) {
    case 1:
      isAnswered = answer && answer.first;
      break;
    case 2:
      isAnswered = answer && answer.second;
      break;
    case 3:
      isAnswered = answer && answer.least;
      break;
  }

  continueBtn.disabled = !isAnswered;
}

function continueTerrainQuestion() {
  if (AppState.selectionStage < 3) {
    // Move to next stage
    AppState.selectionStage++;
    renderTerrainQuestion();
  } else {
    // Completed all 3 stages, move to next question
    AppState.selectionStage = 1;
    AppState.currentQuestion++;

    if (AppState.currentQuestion < AppState.terrainQuestions.length) {
      // More questions remain
      renderTerrainQuestion();
    } else {
      // All 8 questions complete
      finishTerrainAssessment();
    }
  }
}

function finishTerrainAssessment() {
  console.log('✅ All terrain questions answered');
  console.log('Answers:', AppState.terrainAnswers);

  // Check if probing question is needed
  if (needsProbingQuestion(AppState.terrainAnswers)) {
    console.log('⚠️ Probing question triggered (Secure-First Override)');
    showProbingQuestion();
  } else {
    // Calculate terrain immediately
    calculateAndSaveTerrain();
  }
}

function showProbingQuestion() {
  // Render probing question (similar structure)
  AppState.currentQuestion = 'probing';
  AppState.selectionStage = 1;

  const questionTextEl = document.getElementById('terrain-question-text');
  if (questionTextEl) {
    questionTextEl.innerHTML = `
      <div class="stage-prompt">One more thing...</div>
      <div class="question-text">${PROBING_QUESTION.text}</div>
    `;
  }

  // Update progress
  const progressText = document.getElementById('terrain-progress-text');
  if (progressText) {
    progressText.textContent = 'Final Question';
  }

  // Render probing options
  const optionsGrid = document.getElementById('terrain-options-grid');
  if (optionsGrid) {
    const options = shuffleArray([...PROBING_QUESTION.options]);
    optionsGrid.innerHTML = options.map(option => `
      <button
        class="option-card"
        data-option-id="${option.id}"
        onclick="selectProbingOption('${option.id}')"
      >
        <div class="option-text">${option.text}</div>
      </button>
    `).join('');
  }

  updateContinueButton();
}

function selectProbingOption(optionId) {
  AppState.terrainAnswers.probing = { first: optionId };

  // Highlight selected
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.option-card').classList.add('selected');

  updateContinueButton();
}

async function calculateAndSaveTerrain() {
  console.log('🧮 Calculating terrain...');

  // Get probing answer if it exists
  const probingAnswer = AppState.terrainAnswers.probing?.first || null;

  // Calculate terrain profile
  const terrainProfile = calculateTerrain(AppState.terrainAnswers, probingAnswer);

  console.log('✅ Terrain calculated:', terrainProfile);

  // Save to state and localStorage
  AppState.terrainProfile = terrainProfile;
  localStorage.setItem('somasense_terrain', JSON.stringify(terrainProfile));

  // Save to Firestore if signed in, otherwise cache
  if (AppState.isGuest) {
    console.log('💾 Guest user - caching Terrain data');
    cacheTerrainData(terrainProfile);
  } else {
    console.log('💾 Signed-in user - saving to Firestore');
    await saveTerrainToFirestore(terrainProfile);
  }

  // Show terrain reveal screen
  showScreen('terrain-reveal');
}

// ===== TERRAIN REVEAL =====

function populateTerrainReveal() {
  if (!AppState.terrainProfile) {
    console.error('❌ No terrain profile to display');
    return;
  }

  const { archetype, archetype_display_name, primary_terrain, secondary_terrain } = AppState.terrainProfile;

  // Update archetype name
  const archetypeNameEl = document.getElementById('archetype-name');
  if (archetypeNameEl) {
    archetypeNameEl.textContent = archetype_display_name;
  }

  // Get archetype content
  const content = getArchetypeContent(archetype);

  // Update archetype image
  const archetypeImgEl = document.getElementById('archetype-image');
  if (archetypeImgEl && content) {
    archetypeImgEl.src = `/images/${content.imageFile}`;
    archetypeImgEl.alt = archetype_display_name;
    archetypeImgEl.style.display = 'block';
    // Hide image if it fails to load
    archetypeImgEl.onerror = () => {
      console.error('❌ Failed to load archetype image:', content.imageFile);
      archetypeImgEl.style.display = 'none';
    };
  }

  // Update intro text
  const introEl = document.getElementById('archetype-intro');
  if (introEl && content) {
    introEl.textContent = content.intro;
  }

  // Load archetype details
  loadArchetypeContent(archetype);
}

async function loadArchetypeContent(archetypeCode) {
  console.log('📖 Loading archetype content for:', archetypeCode);

  // Get archetype content
  const content = getArchetypeContent(archetypeCode);
  if (!content) {
    console.error('❌ Archetype content not found:', archetypeCode);
    return;
  }

  // Define sections to display
  const sections = [
    {
      id: 'core-recognition',
      title: 'What this means',
      content: content.coreRecognition
    },
    {
      id: 'protective-logic',
      title: 'Why you do this',
      content: content.protectiveLogic
    },
    {
      id: 'cost-under-stress',
      title: 'What it costs',
      content: content.costUnderStress
    },
    {
      id: 'repulsion-disavowal',
      title: 'What feels "not you"',
      content: content.repulsionDisavowal
    }
  ];

  // Render expandable sections
  const contentContainer = document.querySelector('#terrain-reveal .archetype-content');
  if (contentContainer) {
    contentContainer.innerHTML = sections.map(section => `
      <details class="archetype-section" open>
        <summary>${section.title}</summary>
        <div class="section-content">${section.content}</div>
      </details>
    `).join('');
  }

  console.log('✅ Archetype content loaded');
}

// ===== TERRAIN GATE (24H RECONFIRMATION) =====

function populateTerrainGate() {
  if (!AppState.terrainProfile) return;

  const { archetype_display_name } = AppState.terrainProfile;

  const gateText = document.querySelector('#terrain-gate .gate-text');
  if (gateText) {
    gateText.textContent = `We last saw you as a ${archetype_display_name}. Still feeling like a ${archetype_display_name}?`;
  }
}

function confirmTerrain() {
  // User confirmed terrain is still accurate
  localStorage.setItem('somasense_last_used', Date.now().toString());
  showScreen('daily-welcome');
}

async function retakeTerrain() {
  // HARD RESET: Clear everything and start fresh like a new user
  console.log('🔄 HARD RESET: Clearing all data...');

  // Clear all AppState data
  AppState.terrainProfile = null;
  AppState.terrainAnswers = {};
  AppState.currentQuestion = 0;
  AppState.selectionStage = 1;
  AppState.availableOptions = [];
  AppState.currentCheckIn = {};
  AppState.pendingAffectSelection = null;

  // Clear all localStorage items
  localStorage.removeItem('somasense_terrain');
  localStorage.removeItem('somasense_last_used');
  localStorage.removeItem('somasense_first_checkin_welcome_seen');
  localStorage.removeItem('somasense_checkin_count');
  localStorage.removeItem('somasense_signup_prompt_shown');
  localStorage.removeItem('cachedTerrainData');

  // If user is signed in (not guest), also delete from Firestore
  if (!AppState.isGuest) {
    console.log('🗑️ User is signed in - deleting data from Firestore...');
    await deleteAllUserDataFromFirestore();
  }

  // Reload the page to start completely fresh
  console.log('🔄 Reloading page...');
  window.location.reload();
}

// ===== GLOBAL HEADER UPDATE =====

function updateGlobalHeader() {
  // Set user name in header (use first name from auth or "Guest")
  const userNameEl = document.getElementById('welcome-user-name');
  if (userNameEl) {
    let userName = 'Guest';

    // Try to get name from Firebase Auth if signed in
    if (!AppState.isGuest && window.firebaseAuth?.currentUser) {
      const displayName = window.firebaseAuth.currentUser.displayName;
      if (displayName) {
        // Extract first name only
        userName = displayName.split(' ')[0].toLowerCase();
      }
    }

    userNameEl.textContent = userName;
  }

  // Get check-in count from localStorage and format as 3-digit number
  const checkInCount = parseInt(localStorage.getItem('somasense_checkin_count') || '0');
  const countBadgeEl = document.getElementById('checkin-count-header');
  if (countBadgeEl) {
    // Pad to 3 digits: 001, 002, ... 099, 100, 101, ...
    const paddedCount = checkInCount.toString().padStart(3, '0');
    countBadgeEl.textContent = paddedCount;
  }
}

// ===== DAILY WELCOME =====

function populateDailyWelcome() {
  // Update global header (username + check-in count)
  updateGlobalHeader();

  // Populate affect grid on daily-welcome screen
  const dailyGrid = document.getElementById('daily-affect-grid');
  if (dailyGrid) {
    dailyGrid.innerHTML = AFFECTS.map(affect => `
      <div class="affect-card" data-affect-id="${affect.id}">
        <div class="affect-icon">
          <img src="${affect.iconUrl}" alt="${affect.name}" class="affect-icon-img" />
        </div>
        <div class="affect-name">${affect.name}</div>
        <div class="affect-description">${affect.description}</div>
      </div>
    `).join('');

    // Add click handlers to affect cards
    dailyGrid.querySelectorAll('.affect-card').forEach(card => {
      card.addEventListener('click', () => {
        const affectId = card.dataset.affectId;
        handleAffectSelection(affectId);
      });
    });
  }

  // Update last used timestamp
  localStorage.setItem('somasense_last_used', Date.now().toString());
}

// ===== CHECK-IN SYSTEM =====

/**
 * Handle affect selection from daily welcome screen
 * Shows signup prompt for guests on first check-in attempt
 */
function handleAffectSelection(affectId) {
  console.log('✅ Affect selected from daily welcome:', affectId);

  // Check if user is guest and hasn't seen signup prompt
  const hasSeenSignupPrompt = localStorage.getItem('somasense_signup_prompt_shown') === 'true';

  if (AppState.isGuest && !hasSeenSignupPrompt) {
    console.log('💾 First check-in as guest - showing signup prompt');

    // Store the selected affect so we can continue after signup/skip
    AppState.pendingAffectSelection = affectId;

    // Mark that we've shown the prompt
    localStorage.setItem('somasense_signup_prompt_shown', 'true');

    // Show the signup modal
    showSaveTerrainPrompt();
  } else {
    // Continue directly to affect selection screen
    continueWithAffectSelection(affectId);
  }
}

/**
 * Continue with affect selection (after signup prompt or directly)
 */
function continueWithAffectSelection(affectId) {
  // Store in check-in state
  AppState.currentCheckIn.affect = affectId;

  // Show affect selection screen with this affect pre-selected
  showScreen('affect-selection');
  renderAffectSelection();
  selectAffect(affectId);
}

function renderAffectSelection() {
  const grid = document.getElementById('affect-grid');
  if (!grid) return;

  grid.innerHTML = AFFECTS.map(affect => `
    <div class="affect-card" onclick="selectAffect('${affect.id}')">
      <div class="affect-icon">
        <img src="${affect.iconUrl}" alt="${affect.name}" class="affect-icon-img" />
      </div>
      <div class="affect-name">${affect.shortName}</div>
      <div class="affect-description">${affect.description}</div>
    </div>
  `).join('');
}

function selectAffect(affectId) {
  console.log('✅ Affect selected:', affectId);

  // Store in check-in state
  AppState.currentCheckIn.affect = affectId;

  // Highlight selected card
  document.querySelectorAll('.affect-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.affect-card').classList.add('selected');

  // Navigate immediately (no auto-advance delay)
  showScreen('relational-direction');
}

function renderRelationalDirection() {
  const container = document.getElementById('direction-options');
  if (!container) return;

  container.innerHTML = RELATIONAL_DIRECTIONS.map(dir => `
    <button class="option-card" onclick="selectDirection('${dir.id}')">
      <div class="option-text">
        <strong>${dir.label}</strong><br>
        ${dir.description}
      </div>
    </button>
  `).join('');
}

function selectDirection(directionId) {
  console.log('✅ Direction selected:', directionId);

  // Store in check-in state
  AppState.currentCheckIn.direction = directionId;

  // Highlight selected
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.option-card').classList.add('selected');

  // Tap-and-go: Auto-advance after 300ms
  setTimeout(() => {
    showScreen('chronicity-selection');
  }, 300);
}

function renderChronicitySelection() {
  const container = document.getElementById('chronicity-options');
  if (!container) return;

  container.innerHTML = CHRONICITY_OPTIONS.map(option => `
    <button class="option-card" onclick="selectChronicity('${option.id}')">
      <div class="option-text">
        <strong>${option.label}</strong><br>
        ${option.description}
      </div>
    </button>
  `).join('');
}

function selectChronicity(chronicityId) {
  console.log('✅ Chronicity selected:', chronicityId);

  // Store in check-in state
  AppState.currentCheckIn.chronicity = chronicityId;

  // Highlight selected
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.option-card').classList.add('selected');

  // Tap-and-go: Auto-advance after 300ms
  setTimeout(() => {
    showScreen('intensity-selection');
  }, 300);
}

function renderIntensitySelection() {
  const container = document.getElementById('intensity-options');
  if (!container) return;

  container.innerHTML = INTENSITY_LEVELS.map(level => `
    <button class="option-card" onclick="selectIntensity('${level.id}')">
      <div class="option-text">
        <strong>${level.label}</strong><br>
        ${level.description}
      </div>
    </button>
  `).join('');
}

function selectIntensity(intensityId) {
  console.log('✅ Intensity selected:', intensityId);

  // Store in check-in state
  AppState.currentCheckIn.intensity = intensityId;

  // Highlight selected
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.option-card').classList.add('selected');

  // Tap-and-go: Auto-advance after 300ms
  setTimeout(() => {
    showScreen('action-impulse');
  }, 300);
}

function renderActionImpulse() {
  const container = document.getElementById('impulse-options');
  if (!container) return;

  container.innerHTML = ACTION_IMPULSES.map(impulse => `
    <button class="impulse-card" onclick="selectImpulse('${impulse.id}')">
      <div class="impulse-icon">
        <i data-lucide="${impulse.lucideIcon}"></i>
      </div>
      <div class="impulse-text">
        <div class="impulse-label">${impulse.label}</div>
        <div class="impulse-description">${impulse.description}</div>
      </div>
    </button>
  `).join('');

  // Initialize Lucide icons after rendering
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function selectImpulse(impulseId) {
  console.log('✅ Impulse selected:', impulseId);

  // Store in check-in state
  AppState.currentCheckIn.impulse = impulseId;

  // Highlight selected
  document.querySelectorAll('.impulse-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.target.closest('.impulse-card').classList.add('selected');

  // All Check-In data collected, process it
  setTimeout(() => {
    processCheckIn();
  }, 300);
}

async function processCheckIn() {
  console.log('🧮 Processing check-in...');
  console.log('Check-in data:', AppState.currentCheckIn);

  // Show loading overlay
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
  }

  // Calculate metabolic state
  const metabolicState = getMetabolicState(
    AppState.currentCheckIn.chronicity,
    AppState.currentCheckIn.intensity
  );
  console.log('Metabolic state:', metabolicState.state);

  // Get terrain info
  const terrain = AppState.terrainProfile;
  if (!terrain) {
    console.error('❌ No terrain profile found');
    alert('Please complete the Terrain assessment first.');
    showScreen('onboarding-intro');
    return;
  }

  try {
    // Call Cloud Function to generate readout
    const FUNCTION_URL = window.location.hostname === 'localhost'
      ? 'http://localhost:5001/realness-score/us-central1/generateReadout'
      : 'https://us-central1-realness-score.cloudfunctions.net/generateReadout';

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        affect: AppState.currentCheckIn.affect,
        direction: AppState.currentCheckIn.direction,
        chronicity: AppState.currentCheckIn.chronicity,
        intensity: AppState.currentCheckIn.intensity,
        impulse: AppState.currentCheckIn.impulse,
        archetype: terrain.archetype,
        archetypeDisplayName: terrain.archetype_display_name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const readout = data.result;

    console.log('✅ Readout generated:', readout);

    // Store readout in state
    AppState.currentCheckIn.readout = readout;
    AppState.currentCheckIn.metabolicState = metabolicState.state;
    AppState.currentCheckIn.timestamp = new Date().toISOString();

    // Save Check-In to Firestore
    await saveCheckInToFirestore({
      affect: AppState.currentCheckIn.affect,
      direction: AppState.currentCheckIn.direction,
      context: AppState.currentCheckIn.context || null,
      chronicity: AppState.currentCheckIn.chronicity,
      intensity: AppState.currentCheckIn.intensity,
      impulse: AppState.currentCheckIn.impulse,
      archetype: terrain.archetype,
      metabolicState: metabolicState.state,
      readout: {
        mirror: readout.mirror || null,
        reframe: readout.reframe || null,
        opening: readout.opening || null,
        closure: readout.closure || null,
        fullText: readout.fullText || null
      },
      safetyFlags: {
        crisisDetected: readout.crisisDetected || false,
        crisisLevel: readout.crisisLevel || 'none'
      }
    });

    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.classList.remove('active');
    }

    // Increment check-in count
    const count = parseInt(localStorage.getItem('somasense_checkin_count') || '0');
    localStorage.setItem('somasense_checkin_count', (count + 1).toString());

    // Check if hard crisis was detected (Tier 1 - requires intervention)
    if (readout.crisisDetected && readout.crisisLevel === 'hard_crisis') {
      console.log('⚠️ Hard crisis detected - showing crisis resources');
      showScreen('crisis-resources');
    } else {
      // Show normal results screen (may include Tier 2-4 safety content)
      showScreen('results');
    }

  } catch (error) {
    console.error('❌ Error generating readout:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      checkInData: {
        affect: AppState.currentCheckIn.affect,
        intensity: AppState.currentCheckIn.intensity,
        chronicity: AppState.currentCheckIn.chronicity
      }
    });

    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.classList.remove('active');
    }

    // Show error message (better UX than alert)
    const errorMessage = error.message.includes('fetch')
      ? 'Unable to connect. Please check your internet connection and try again.'
      : `Error generating readout: ${error.message}`;

    // Create error modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.cssText = 'display: flex; z-index: 1000;';
    modal.innerHTML = `
      <div class="modal-content">
        <h2 class="heading-1" style="margin-bottom: 16px;">Connection Error</h2>
        <p class="body" style="color: var(--gray-300); margin-bottom: 24px;">
          ${errorMessage}
        </p>
        <div style="display: flex; gap: 12px; flex-direction: column;">
          <button class="btn btn-large" id="error-retry-btn">Try Again</button>
          <button class="btn btn-ghost" id="error-back-btn">Go Back</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Retry button
    document.getElementById('error-retry-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      generateReadout(); // Retry
    });

    // Back button
    document.getElementById('error-back-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      AppState.currentCheckIn = {};
      showScreen('daily-welcome');
    });
  }
}

// ===== RESULTS SCREEN =====

function populateResults() {
  if (!AppState.currentCheckIn.readout) {
    console.error('❌ No readout to display');
    return;
  }

  const {affect, direction, chronicity, intensity, readout} = AppState.currentCheckIn;
  const affectData = getAffectById(affect);

  // Populate header
  document.getElementById('results-affect-icon').textContent = affectData?.icon || '';
  document.getElementById('results-affect-name').textContent = affectData?.name || affect;
  document.getElementById('results-meta').textContent = `${direction} · ${chronicity} · ${intensity}`;

  // Populate readout
  document.getElementById('results-mirror').textContent = readout.mirror;

  // Build reframe with safety content if applicable
  let reframeText = readout.reframe;

  // Add grounding prompt for Tier 2
  if (readout.crisisLevel === 'reality_detachment' && readout.groundingPrompt) {
    reframeText += `\n\n⚓ ${readout.groundingPrompt}`;
  }

  // Add grounding exercise for Tier 3
  if (readout.crisisLevel === 'severe_dissociation' && readout.groundingExercise) {
    reframeText += `\n\n⚓ Grounding: ${readout.groundingExercise}`;
  }

  // Add resource bridge for Tier 4
  if (readout.crisisLevel === 'soft_risk' && readout.resourceBridge) {
    reframeText += `\n\n${readout.resourceBridge}`;
  }

  document.getElementById('results-reframe').textContent = reframeText;
  document.getElementById('results-opening').textContent = readout.opening;
  document.getElementById('results-closure').textContent = readout.closure;

  // Populate terrain context
  const terrain = AppState.terrainProfile;
  if (terrain) {
    const archetypeContent = getArchetypeContent(terrain.archetype);
    document.getElementById('results-terrain-icon').textContent = '🧭';
    document.getElementById('results-terrain-name').textContent = terrain.archetype_display_name;
    document.getElementById('results-terrain-desc').textContent = archetypeContent?.intro || '';
  }

  // Show safety resources for Tiers 2-4
  if (readout.crisisDetected && readout.resources) {
    console.log('📋 Safety resources included (Tier 2-4)');
    // TODO: Add expandable resources section to results screen
  }

  // Show sign-in banner if guest
  const banner = document.getElementById('results-signin-banner');
  if (banner && AppState.isGuest) {
    banner.style.display = 'block';
    banner.onclick = handleSignIn;
  } else if (banner) {
    banner.style.display = 'none';
  }
}

// ===== CRISIS RESOURCES SCREEN (Tier 1 - Hard Crisis) =====

function populateCrisisResources() {
  const readout = AppState.currentCheckIn.readout;
  if (!readout || !readout.resources) {
    console.error('❌ No crisis resources to display');
    return;
  }

  const resources = readout.resources;

  // Populate title and message
  document.getElementById('crisis-title').textContent = resources.title;
  document.getElementById('crisis-message').textContent = resources.message;

  // Populate contact cards
  const contactsContainer = document.getElementById('crisis-contacts');
  if (contactsContainer) {
    contactsContainer.innerHTML = resources.contacts.map(contact => `
      <div style="background: var(--gray-900); border: 1px solid var(--gray-800); padding: 20px; margin-bottom: 16px;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">${contact.name}</div>
        ${contact.number ? `<div style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--green);">${contact.number}</div>` : ''}
        ${contact.url ? `<div style="margin-bottom: 8px;"><a href="${contact.url}" target="_blank" style="color: var(--white); text-decoration: underline;">${contact.url}</a></div>` : ''}
        <div style="font-size: 14px; color: var(--gray-400);">${contact.description}</div>
      </div>
    `).join('');
  }
}

// ===== GLOBAL FUNCTIONS FOR CHECK-IN =====

window.selectAffect = selectAffect;
window.selectDirection = selectDirection;
window.selectChronicity = selectChronicity;
window.selectIntensity = selectIntensity;
window.selectImpulse = selectImpulse;

// ===== EVENT LISTENERS =====

function setupEventListeners() {
  // Welcome screen
  document.getElementById('btn-sign-in')?.addEventListener('click', handleSignIn);
  document.getElementById('btn-continue-guest')?.addEventListener('click', () => {
    showScreen('onboarding-intro');
  });

  // Save Terrain Modal
  document.getElementById('btn-modal-sign-in')?.addEventListener('click', handleSignIn);
  document.getElementById('btn-modal-skip')?.addEventListener('click', () => {
    hideSaveTerrainPrompt();
    // If there's a pending affect selection, continue with it
    if (AppState.pendingAffectSelection) {
      const affectId = AppState.pendingAffectSelection;
      AppState.pendingAffectSelection = null; // Clear it
      continueWithAffectSelection(affectId);
    }
  });

  // First Check-In Welcome Modal
  document.getElementById('btn-first-checkin-gotit')?.addEventListener('click', hideFirstCheckinWelcome);

  // Terrain gate
  document.getElementById('btn-confirm-terrain')?.addEventListener('click', confirmTerrain);
  document.getElementById('btn-retake-terrain')?.addEventListener('click', async () => {
    await retakeTerrain();
  });

  // Onboarding
  document.getElementById('btn-begin-onboarding')?.addEventListener('click', () => {
    showScreen('terrain-questions');
  });

  // Terrain questions - continue button
  document.getElementById('terrain-continue-btn')?.addEventListener('click', continueTerrainQuestion);

  // Terrain reveal
  document.getElementById('btn-continue-from-reveal')?.addEventListener('click', async () => {
    // 🔒 SPEC REQUIREMENT: Screen 3.5 - Save Terrain Prompt for guest users
    if (AppState.isGuest) {
      console.log('💾 User is guest - showing Screen 3.5: Save Terrain Prompt');
      showSaveTerrainPrompt();
      return;
    }

    // Signed-in users: Show first check-in welcome if not seen
    const welcomeShown = await showFirstCheckinWelcome();

    // If welcome wasn't shown (already seen), go directly to daily welcome
    if (!welcomeShown) {
      showScreen('daily-welcome');
    }
    // Otherwise, modal is showing and will navigate on dismiss
  });

  // Daily welcome
  document.getElementById('btn-checkin-now')?.addEventListener('click', () => {
    showScreen('affect-selection');
  });

  // Results screen
  document.getElementById('btn-checkin-again')?.addEventListener('click', () => {
    AppState.currentCheckIn = {};
    showScreen('affect-selection');
  });

  document.getElementById('btn-view-terrain')?.addEventListener('click', () => {
    showScreen('terrain-reveal');
  });

  // Crisis resources screen
  document.getElementById('btn-crisis-continue')?.addEventListener('click', () => {
    // User acknowledged crisis resources, return to daily welcome
    AppState.currentCheckIn = {};
    showScreen('daily-welcome');
  });

  console.log('✅ Event listeners attached');
}

// ===== AUTHENTICATION =====

async function handleSignIn() {
  console.log('🔐 Signing in with Google...');

  const result = await signInWithGoogle();

  if (result.success) {
    console.log('✅ Sign-in successful');
    // Update AppState
    AppState.userId = result.user.uid;
    AppState.isGuest = false;

    // Dismiss modal if showing
    const modal = document.getElementById('save-terrain-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    // Load terrain from Firestore to determine where to navigate
    const firestoreTerrain = await loadTerrainFromFirestore();

    if (firestoreTerrain) {
      // User has terrain in Firestore
      AppState.terrainProfile = firestoreTerrain;
      localStorage.setItem('somasense_terrain', JSON.stringify(firestoreTerrain));
      console.log('✅ Terrain loaded from Firestore after sign-in:', firestoreTerrain.archetype);

      // If there's a pending affect selection, continue with it
      if (AppState.pendingAffectSelection) {
        const affectId = AppState.pendingAffectSelection;
        AppState.pendingAffectSelection = null; // Clear it
        continueWithAffectSelection(affectId);
      } else {
        // Check if terrain is stale (24h gate)
        const lastUsed = localStorage.getItem('somasense_last_used');
        const now = Date.now();
        if (lastUsed && now - parseInt(lastUsed) > 24 * 60 * 60 * 1000) {
          showScreen('terrain-gate');
        } else {
          showScreen('daily-welcome');
        }
      }
    } else {
      // No terrain in Firestore - user needs to take assessment
      console.log('ℹ️ No terrain found - redirecting to onboarding');
      AppState.terrainProfile = null;
      localStorage.removeItem('somasense_terrain');
      showScreen('onboarding-intro');
    }
  } else {
    console.error('❌ Sign-in failed:', result.error);
    alert('Sign-in failed. Please try again.');
  }
}

function showSaveTerrainPrompt() {
  console.log('💾 Showing save terrain prompt...');

  const modal = document.getElementById('save-terrain-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Trigger animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }
}

async function hideSaveTerrainPrompt() {
  const modal = document.getElementById('save-terrain-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  // Screen 3.5 dismissed - Continue proper flow
  // Show first check-in welcome if not seen, then daily welcome
  const welcomeShown = await showFirstCheckinWelcome();
  if (!welcomeShown) {
    showScreen('daily-welcome');
  }
}

// ===== FIRST CHECK-IN WELCOME =====

async function showFirstCheckinWelcome() {
  console.log('👋 Showing first check-in welcome...');

  // Check if user has already seen the welcome
  const hasSeenWelcome = localStorage.getItem('somasense_first_checkin_welcome_seen') === 'true';
  if (hasSeenWelcome) {
    console.log('ℹ️ User has already seen first check-in welcome, skipping');
    return false;
  }

  // Get archetype
  if (!AppState.terrainProfile || !AppState.terrainProfile.archetype) {
    console.error('❌ No archetype found for first check-in welcome');
    return false;
  }

  const archetype = AppState.terrainProfile.archetype;

  // Load config and get welcome message
  const config = await loadFirstCheckinConfig();
  const welcomeMessage = getWelcomeMessage(archetype, config);

  // Update modal content
  document.getElementById('first-checkin-headline').textContent = config.headline;
  document.getElementById('first-checkin-message').textContent = welcomeMessage;
  document.getElementById('btn-first-checkin-gotit').textContent = config.buttonText;

  // Show modal
  const modal = document.getElementById('first-checkin-welcome-modal');
  if (modal) {
    modal.style.display = 'flex';
    // Trigger animation
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  return true;
}

function hideFirstCheckinWelcome() {
  const modal = document.getElementById('first-checkin-welcome-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }

  // Mark as seen in localStorage
  localStorage.setItem('somasense_first_checkin_welcome_seen', 'true');
  console.log('✅ First check-in welcome dismissed');

  // Continue to daily welcome
  showScreen('daily-welcome');
}

// ===== UTILITY FUNCTIONS =====

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== GLOBAL FUNCTIONS (called from HTML onclick) =====

window.selectTerrainOption = selectTerrainOption;
window.selectProbingOption = selectProbingOption;

// ===== UTILITY FUNCTIONS FOR TESTING =====

/**
 * Reset terrain profile (for testing/debugging)
 * Call from console: window.resetTerrain()
 */
window.resetTerrain = async function() {
  console.log('🔄 Resetting terrain profile...');

  // Clear local state
  AppState.terrainProfile = null;
  AppState.terrainAnswers = {};

  // Clear localStorage
  localStorage.removeItem('somasense_terrain');
  localStorage.removeItem('somasense_last_used');
  localStorage.removeItem('cachedTerrainData');

  // Clear Firestore if signed in
  if (!AppState.isGuest && window.firebaseDb) {
    try {
      const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userId = AppState.userId;
      if (userId) {
        await deleteDoc(doc(window.firebaseDb, 'userTerrains', userId));
        console.log('✅ Terrain deleted from Firestore');
      }
    } catch (error) {
      console.log('ℹ️ No Firestore terrain to delete or error:', error.message);
    }
  }

  console.log('✅ Terrain reset complete - reload page to start fresh');
  alert('Terrain reset! Reloading page...');
  window.location.reload();
};

// ===== HAMBURGER MENU =====

function initializeMenu() {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const menuModal = document.getElementById('menu-modal');
  const menuCloseBtn = document.getElementById('menu-close-btn');
  const diaryModal = document.getElementById('diary-modal');
  const diaryCloseBtn = document.getElementById('diary-close-btn');

  // Show/hide logout button based on auth state
  const logoutBtn = document.getElementById('menu-logout-btn');
  if (logoutBtn) {
    logoutBtn.style.display = AppState.isGuest ? 'none' : 'flex';
  }

  // Open menu
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      menuModal.classList.add('active');
    });
  }

  // Close menu
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', () => {
      menuModal.classList.remove('active');
    });
  }

  // Menu item: Check-In Diary
  document.getElementById('menu-diary-btn').addEventListener('click', async () => {
    menuModal.classList.remove('active');
    await showDiary();
  });

  // Menu item: Re-take Terrain
  document.getElementById('menu-retake-terrain-btn').addEventListener('click', async () => {
    menuModal.classList.remove('active');
    await retakeTerrain();
  });

  // Menu item: Reset Check-in Counts
  document.getElementById('menu-reset-counts-btn').addEventListener('click', () => {
    menuModal.classList.remove('active');
    localStorage.setItem('somasense_checkin_count', '0');
    localStorage.removeItem('somasense_first_checkin_welcome_seen');
    updateGlobalHeader();
    alert('Check-in count reset to 001!');
  });

  // Menu item: Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      menuModal.classList.remove('active');
      try {
        await window.firebaseAuth.signOut();
        localStorage.clear();
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
      }
    });
  }

  // Close diary
  if (diaryCloseBtn) {
    diaryCloseBtn.addEventListener('click', () => {
      diaryModal.classList.remove('active');
    });
  }
}

// Show Check-In Diary
async function showDiary() {
  const diaryModal = document.getElementById('diary-modal');
  const container = document.getElementById('diary-entries-container');
  const showMoreBtn = document.getElementById('diary-show-more-btn');

  container.innerHTML = '<p class="body" style="color: var(--gray-400);">Loading your check-ins...</p>';
  diaryModal.classList.add('active');

  try {
    // Get check-ins from Firestore
    if (!window.firebaseDb) {
      container.innerHTML = '<p class="body" style="color: var(--gray-400);">Sign in to view your check-in history.</p>';
      return;
    }

    const { collection, query, where, orderBy, limit: firestoreLimit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const userId = AppState.userId;
    if (!userId) {
      container.innerHTML = '<p class="body" style="color: var(--gray-400);">Sign in to view your check-in history.</p>';
      return;
    }

    const checkInsRef = collection(window.firebaseDb, 'checkIns');
    const q = query(
      checkInsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(5)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = '<p class="body" style="color: var(--gray-400);">No check-ins yet. Complete your first check-in to see it here!</p>';
      return;
    }

    // Render diary entries
    let html = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp?.toDate() || new Date();
      const affectData = getAffectById(data.affect_internal_id || data.affect);

      html += `
        <div class="diary-entry">
          <div class="diary-entry-header">
            <div class="diary-entry-affect">
              <span>${affectData?.icon || '◯'}</span>
              <span>${affectData?.name || data.affect}</span>
            </div>
            <div class="diary-entry-time">${formatDate(date)}</div>
          </div>
          <div class="diary-entry-meta">
            ${data.relational_direction || 'Unknown'} ·
            ${data.chronicity || 'N/A'} ·
            Intensity: ${data.intensity || 'N/A'}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Show "Show more" button if there might be more entries
    if (snapshot.size === 5) {
      showMoreBtn.style.display = 'block';
    } else {
      showMoreBtn.style.display = 'none';
    }

  } catch (error) {
    console.error('Error loading diary:', error);
    container.innerHTML = '<p class="body" style="color: var(--red);">Error loading check-ins. Please try again.</p>';
  }
}

function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== START APP =====

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { AppState, showScreen };
