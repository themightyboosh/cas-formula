// Realness Score Assessment App
// Vanilla JavaScript implementation

// Load data files
let config, questions, archetypes;

async function loadData() {
    try {
        const [configRes, questionsRes, archetypesRes] = await Promise.all([
            fetch('data/config.json'),
            fetch('data/questions.json'),
            fetch('data/archetypes.json')
        ]);
        
        config = await configRes.json();
        questions = await questionsRes.json();
        archetypes = await archetypesRes.json();
        
        return { config, questions, archetypes };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// State management
const state = {
    responses: {},
    currentEmail: null,
    result: null,
    currentQuestionIndex: 0, // Track current question (0-39)
    questions: [] // Will be populated with all questions in order
};

// DOM elements - initialize as empty object, populate after DOM is ready
const elements = {};

// Initialize DOM elements
function initElements() {
    elements.landingScreen = document.getElementById('landingScreen');
    elements.startBtn = document.getElementById('startBtn');
    elements.compactHeader = document.getElementById('compactHeader');
    elements.assessmentSection = document.getElementById('assessmentSection');
    elements.resultsSection = document.getElementById('resultsSection');
    elements.progressText = document.getElementById('progressText');
    elements.progressFill = document.getElementById('progressFill');
    elements.domainCategoryHeader = document.getElementById('domainCategoryHeader');
    elements.domainCategoryTitle = document.getElementById('domainCategoryTitle');
    elements.domainCategoryDescription = document.getElementById('domainCategoryDescription');
    elements.errorBanner = document.getElementById('errorBanner');
    elements.emailModal = document.getElementById('emailModal');
    elements.emailForm = document.getElementById('emailForm');
    elements.emailInput = document.getElementById('emailInput');
    elements.questionNavigation = document.getElementById('questionNavigation');
    elements.prevBtn = document.getElementById('prevBtn');
    elements.nextBtn = document.getElementById('nextBtn');
    elements.submitBtn = document.getElementById('submitBtn');
    elements.submitButtonContainer = document.getElementById('submitButtonContainer');
    elements.stickyButton = document.getElementById('stickyButton');
    elements.stickySubmitBtn = document.getElementById('stickySubmitBtn');
    elements.retakeBtn = document.getElementById('retakeBtn');
    elements.archetypeName = document.getElementById('archetypeName');
    elements.archetypeTag = document.getElementById('archetypeTag');
    elements.archetypeDescription = document.getElementById('archetypeDescription');
    elements.archetypeImage = document.getElementById('archetypeImage');
    elements.domainCharts = document.getElementById('domainCharts');
    elements.compatibilityInfo = document.getElementById('compatibilityInfo');
    elements.shareButtons = document.querySelectorAll('.share-btn');
    elements.nativeShareBtn = document.getElementById('nativeShareBtn');
}

// Initialize analytics
async function initAnalytics() {
    try {
        const analyticsModule = await import('./utils/analytics.js');
        if (analyticsModule && analyticsModule.initAnalytics) {
            analyticsModule.initAnalytics();
        }
        
        // Make analytics functions available globally (with fallbacks)
        if (typeof window !== 'undefined') {
            window.trackAssessmentStarted = (analyticsModule && analyticsModule.trackAssessmentStarted) || (() => {});
            window.trackAssessmentCompleted = (analyticsModule && analyticsModule.trackAssessmentCompleted) || (() => {});
            window.trackEmailCollected = (analyticsModule && analyticsModule.trackEmailCollected) || (() => {});
            window.trackResultsShared = (analyticsModule && analyticsModule.trackResultsShared) || (() => {});
            window.trackArchetypeResult = (analyticsModule && analyticsModule.trackArchetypeResult) || (() => {});
            window.trackQuestionAnswered = (analyticsModule && analyticsModule.trackQuestionAnswered) || (() => {});
            window.trackDomainCompleted = (analyticsModule && analyticsModule.trackDomainCompleted) || (() => {});
        }
    } catch (error) {
        // Silently handle analytics errors - not critical for app functionality
        if (typeof window !== 'undefined') {
            window.trackAssessmentStarted = () => {};
            window.trackAssessmentCompleted = () => {};
            window.trackEmailCollected = () => {};
            window.trackResultsShared = () => {};
            window.trackArchetypeResult = () => {};
            window.trackQuestionAnswered = () => {};
            window.trackDomainCompleted = () => {};
        }
    }
}

// Load saved progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('realnessScoreProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.responses = data.responses || {};
            state.currentEmail = data.email || null;
            // Find first unanswered question
            if (data.responses) {
                const firstUnanswered = state.questions.findIndex(q => !data.responses[q.id]);
                if (firstUnanswered >= 0) {
                    state.currentQuestionIndex = firstUnanswered;
                }
            }
            return true;
        } catch (error) {
            console.warn('Error loading saved progress:', error);
        }
    }
    return false;
}

// Save progress to localStorage
function saveProgress() {
    const data = {
        responses: state.responses,
        email: state.currentEmail,
        timestamp: Date.now()
    };
    localStorage.setItem('realnessScoreProgress', JSON.stringify(data));
}

// Clear saved progress
function clearProgress() {
    localStorage.removeItem('realnessScoreProgress');
    state.responses = {};
    state.currentEmail = null;
    state.result = null;
}

// Calculate domain sums
function calculateDomainSums() {
    const sums = { A: 0, B: 0, C: 0, D: 0 };
    
    questions.questions.forEach(q => {
        const answer = state.responses[q.id];
        if (answer && answer >= 1 && answer <= 5) {
            sums[q.domain] += answer;
        }
    });
    
    return sums;
}

// Convert sum to level
function sumToLevel(sum) {
    if (sum <= 23) return 1;
    if (sum <= 36) return 2;
    return 3;
}

// Classify archetype using Manhattan distance
function classifyArchetype(A_level, B_level, C_level, D_level) {
    let best = null;
    let minDist = Infinity;
    
    archetypes.archetypes.forEach(archetype => {
        const dist = Math.abs(A_level - archetype.levels.A) +
                     Math.abs(B_level - archetype.levels.B) +
                     Math.abs(C_level - archetype.levels.C) +
                     Math.abs(D_level - archetype.levels.D);
        
        if (dist < minDist || (dist === minDist && archetype.id < best.id)) {
            minDist = dist;
            best = archetype;
        }
    });
    
    return best;
}

// Check if all questions are answered
function allQuestionsAnswered() {
    return questions.questions.every(q => 
        state.responses[q.id] && state.responses[q.id] >= 1 && state.responses[q.id] <= 5
    );
}

// Update progress indicator
function updateProgress() {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const questionNumber = state.currentQuestionIndex + 1;
    const total = state.questions.length;
    const answered = state.questions.filter(q => 
        state.responses[q.id] && state.responses[q.id] >= 1 && state.responses[q.id] <= 5
    ).length;
    const percentage = (answered / total) * 100;
    
    // Update progress text and bar
    elements.progressText.textContent = `Question ${questionNumber} of ${total}`;
    elements.progressFill.style.width = `${percentage}%`;
    
    // Update domain category header
    if (currentQuestion) {
        const domain = config.domains.find(d => d.id === currentQuestion.domain);
        if (domain) {
            elements.domainCategoryTitle.textContent = `${domain.id}. ${domain.name}`;
            elements.domainCategoryDescription.textContent = domain.description;
            elements.domainCategoryHeader.style.display = 'block';
        }
    }
    
    // Update navigation buttons
    elements.prevBtn.style.display = state.currentQuestionIndex > 0 ? 'inline-block' : 'none';
    
    if (state.currentQuestionIndex === total - 1) {
        // Last question - show submit button
        elements.nextBtn.textContent = 'See My Results';
        elements.nextBtn.className = 'btn btn-primary';
    } else {
        elements.nextBtn.textContent = 'Next';
        elements.nextBtn.className = 'btn btn-primary';
    }
}

// Check domain completion
function isDomainComplete(domainId) {
    const domainQuestions = questions.questions.filter(q => q.domain === domainId);
    return domainQuestions.every(q => 
        state.responses[q.id] && state.responses[q.id] >= 1 && state.responses[q.id] <= 5
    );
}

// Render single question
function renderCurrentQuestion() {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) return;
    
    elements.assessmentSection.innerHTML = '';
    elements.assessmentSection.className = 'question-view';
    
    const questionCard = document.createElement('div');
    questionCard.className = 'question-card single-question';
    questionCard.setAttribute('data-question-id', question.id);
    
    const questionText = document.createElement('p');
    questionText.className = 'question-text';
    questionText.textContent = question.text;
    
    const ratingScale = document.createElement('div');
    ratingScale.className = 'rating-scale';
    ratingScale.setAttribute('role', 'group');
    ratingScale.setAttribute('aria-label', `Rate: ${question.text}`);
    
    const labels = ['Not at all', 'Slightly', 'Somewhat', 'Mostly', 'Very true'];
    
    for (let i = 1; i <= 5; i++) {
        const button = document.createElement('button');
        button.className = `rating-button ${state.responses[question.id] === i ? 'selected' : ''}`;
        button.type = 'button';
        button.setAttribute('aria-label', `${i} - ${labels[i - 1]}`);
        button.onclick = () => {
            selectRating(question.id, i);
            // Auto-advance after a short delay (optional - can be removed)
            // setTimeout(() => nextQuestion(), 300);
        };
        
        const value = document.createElement('div');
        value.textContent = i;
        
        const label = document.createElement('div');
        label.className = 'rating-label';
        label.textContent = labels[i - 1];
        
        button.appendChild(value);
        button.appendChild(label);
        ratingScale.appendChild(button);
    }
    
    questionCard.appendChild(questionText);
    questionCard.appendChild(ratingScale);
    elements.assessmentSection.appendChild(questionCard);
    
    // Add fade-in animation
    elements.assessmentSection.style.opacity = '0';
    setTimeout(() => {
        elements.assessmentSection.style.transition = 'opacity 0.3s ease';
        elements.assessmentSection.style.opacity = '1';
    }, 10);
}

// Select rating for a question
function selectRating(questionId, value) {
    state.responses[questionId] = value;
    saveProgress();
    
    // Update UI immediately
    const questionCard = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionCard) {
        const buttons = questionCard.querySelectorAll('.rating-button');
        buttons.forEach((btn, index) => {
            if (index + 1 === value) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
    
    // Track question answered
    if (window.trackQuestionAnswered) {
        const question = state.questions.find(q => q.id === questionId);
        if (question) {
            window.trackQuestionAnswered(questionId, question.domain, value);
        }
    }
    
    updateProgress();
}

// Navigate to next question
function nextQuestion() {
    if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex++;
        renderCurrentQuestion();
        updateProgress();
    } else {
        // Last question - check if all answered
        if (allQuestionsAnswered()) {
            handleSubmit();
        } else {
            elements.errorBanner.style.display = 'block';
            setTimeout(() => {
                elements.errorBanner.style.display = 'none';
            }, 5000);
        }
    }
}

// Navigate to previous question
function prevQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        renderCurrentQuestion();
        updateProgress();
    }
}

// Render assessment (single question view)
function renderAssessment() {
    // Render current question
    renderCurrentQuestion();
    updateProgress();
}

// Show email modal
function showEmailModal() {
    elements.emailModal.style.display = 'flex';
    elements.emailInput.focus();
    
    // Pre-fill if email exists
    if (state.currentEmail) {
        elements.emailInput.value = state.currentEmail;
    }
}

// Hide email modal
function hideEmailModal() {
    elements.emailModal.style.display = 'none';
}

// Handle email submission
function handleEmailSubmit(e) {
    e.preventDefault();
    
    const email = elements.emailInput.value.trim();
    const optIn = document.getElementById('emailOptIn')?.checked || false;
    
    if (!email || !isValidEmail(email)) {
        elements.emailInput.focus();
        return;
    }
    
    state.currentEmail = email;
    state.emailOptIn = optIn;
    saveProgress();
    
    // Track email collected
    if (window.trackEmailCollected) {
        window.trackEmailCollected();
    }
    
    hideEmailModal();
    calculateAndShowResults();
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Send results email
async function sendResultsEmail(email, optIn, archetype, sums, levels) {
    // Note: Emails are currently stored in localStorage only
    // To actually send emails, you need to implement a backend service
    // This function prepares the data that would be sent
    
    const emailData = {
        email: email,
        optIn: optIn,
        timestamp: new Date().toISOString(),
        archetype: {
            id: archetype.id,
            name: archetype.name,
            shortTag: archetype.shortTag,
            description: archetype.description
        },
        domainScores: {
            A: sums.A,
            B: sums.B,
            C: sums.C,
            D: sums.D
        },
        levels: levels,
        resultsUrl: window.location.href
    };
    
    // Store email data locally
    const storedEmails = JSON.parse(localStorage.getItem('realnessScore_emails') || '[]');
    storedEmails.push(emailData);
    localStorage.setItem('realnessScore_emails', JSON.stringify(storedEmails));
    
    // TODO: Send actual email via backend service
    // Example endpoint: await fetch('/api/send-results-email', { method: 'POST', body: JSON.stringify(emailData) });
    
    console.log('Email data prepared for:', email, emailData);
}

// Calculate and show results
function calculateAndShowResults() {
    const sums = calculateDomainSums();
    const levels = {
        A: sumToLevel(sums.A),
        B: sumToLevel(sums.B),
        C: sumToLevel(sums.C),
        D: sumToLevel(sums.D)
    };
    
    const archetype = classifyArchetype(levels.A, levels.B, levels.C, levels.D);
    state.result = { archetype, sums, levels };
    
    // Track assessment completed
    if (window.trackAssessmentCompleted) {
        window.trackAssessmentCompleted(archetype.id, archetype.name);
    }
    
    if (window.trackArchetypeResult) {
        window.trackArchetypeResult(archetype.id, archetype.name);
    }
    
    // Send email with results
    sendResultsEmail(state.currentEmail, state.emailOptIn, archetype, sums, levels);
    
    renderResults();
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Render results
function renderResults() {
    const { archetype, sums, levels } = state.result;
    
    // Archetype info
    elements.archetypeName.textContent = `You are ${archetype.name}`;
    elements.archetypeTag.textContent = archetype.shortTag;
    elements.archetypeDescription.textContent = archetype.description;
    
    // Archetype image - match actual file names
    const imageName = archetype.name.toLowerCase()
        .replace(/\s+/g, '-');
    const imagePath = `./assets/images/archetype-${archetype.id}-${imageName}.png`;
    elements.archetypeImage.src = imagePath;
    elements.archetypeImage.alt = archetype.name;
    
    // Domain charts
    elements.domainCharts.innerHTML = '';
    config.domains.forEach(domain => {
        const sum = sums[domain.id];
        const level = levels[domain.id];
        const percentage = ((sum - 10) / 40) * 100; // Scale from 10-50 to 0-100%
        
        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = `${domain.id}. ${domain.name}`;
        
        const visual = document.createElement('div');
        visual.className = 'chart-visual';
        
        const fill = document.createElement('div');
        fill.className = 'chart-fill';
        fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        
        visual.appendChild(fill);
        
        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = `${sum}`;
        
        chartBar.appendChild(label);
        chartBar.appendChild(visual);
        chartBar.appendChild(value);
        elements.domainCharts.appendChild(chartBar);
    });
    
    // Compatibility
    const mostCompatible = archetypes.archetypes.find(a => a.name === archetype.mostCompatible);
    const leastCompatible = archetypes.archetypes.find(a => a.name === archetype.leastCompatible);
    
    elements.compatibilityInfo.innerHTML = `
        <p>
            <strong>Most Compatible:</strong> 
            <span>${archetype.mostCompatible}</span>
        </p>
        <p>
            <strong>Challenging Match:</strong> 
            <span>${archetype.leastCompatible}</span>
        </p>
    `;
    
    // Update meta tags for sharing
    updateMetaTags(archetype);
    
    // Show results section
    elements.resultsSection.style.display = 'block';
    elements.assessmentSection.style.display = 'none';
    elements.questionNavigation.style.display = 'none';
    elements.domainCategoryHeader.style.display = 'none';
    elements.submitButtonContainer.style.display = 'none';
    elements.stickyButton.style.display = 'none';
    
    // Hide progress bar on results screen
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.display = 'none';
    }
}

// Update meta tags for social sharing
function updateMetaTags(archetype) {
    const title = `The Realness Score - You are ${archetype.name}`;
    const description = archetype.description;
    
    document.title = title;
    
    // Update Open Graph tags
    document.querySelector('meta[property="og:title"]').setAttribute('content', title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    
    // Update Twitter tags
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
    
    // Update URL with encoded results
    const url = new URL(window.location.href);
    url.searchParams.set('archetype', archetype.id);
    url.searchParams.set('A', state.result.levels.A);
    url.searchParams.set('B', state.result.levels.B);
    url.searchParams.set('C', state.result.levels.C);
    url.searchParams.set('D', state.result.levels.D);
    
    window.history.replaceState({}, '', url);
    document.querySelector('meta[property="og:url"]').setAttribute('content', url.toString());
}

// Share functionality
function shareResults(platform) {
    const { archetype } = state.result;
    const shareUrl = window.location.href;
    const shareText = `I'm ${archetype.name} - ${archetype.shortTag}. Discover your Realness Score: ${shareUrl}`;
    
    // Track sharing
    if (window.trackResultsShared) {
        window.trackResultsShared(platform, archetype.id, archetype.name);
    }
    
    switch (platform) {
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'linkedin':
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(shareUrl).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = 'Link Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
            break;
    }
}

// Native share (mobile)
function nativeShare() {
    const { archetype } = state.result;
    const shareData = {
        title: `I'm ${archetype.name} - ${archetype.shortTag}`,
        text: archetype.description,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).then(() => {
            if (window.trackResultsShared) {
                window.trackResultsShared('native', archetype.id, archetype.name);
            }
        }).catch(err => console.log('Error sharing:', err));
    }
}

// Retake assessment
function retakeAssessment() {
    clearProgress();
    state.result = null;
    state.currentQuestionIndex = 0;
    
    elements.resultsSection.style.display = 'none';
    elements.assessmentSection.style.display = 'block';
    elements.questionNavigation.style.display = 'flex';
    elements.errorBanner.style.display = 'none';
    
    renderAssessment();
    updateProgress();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track assessment started
    if (window.trackAssessmentStarted) {
        window.trackAssessmentStarted();
    }
}

// Handle submit button
function handleSubmit() {
    if (!allQuestionsAnswered()) {
        elements.errorBanner.style.display = 'block';
        setTimeout(() => {
            elements.errorBanner.style.display = 'none';
        }, 5000);
        return;
    }
    
    // Check if email already collected
    if (state.currentEmail) {
        calculateAndShowResults();
    } else {
        showEmailModal();
    }
}

// Handle next button click
function handleNext() {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (currentQuestion && !state.responses[currentQuestion.id]) {
        // Question not answered
        elements.errorBanner.textContent = 'Please answer this question before continuing.';
        elements.errorBanner.style.display = 'block';
        setTimeout(() => {
            elements.errorBanner.style.display = 'none';
        }, 3000);
        return;
    }
    nextQuestion();
}

// Check URL parameters for shared results
function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const archetypeId = params.get('archetype');
    
    if (archetypeId) {
        const archetype = archetypes.archetypes.find(a => a.id === parseInt(archetypeId));
        if (archetype) {
            const A = parseInt(params.get('A')) || 2;
            const B = parseInt(params.get('B')) || 2;
            const C = parseInt(params.get('C')) || 2;
            const D = parseInt(params.get('D')) || 2;
            
            // Calculate approximate sums from levels
            const sums = {
                A: A === 1 ? 15 : A === 2 ? 30 : 45,
                B: B === 1 ? 15 : B === 2 ? 30 : 45,
                C: C === 1 ? 15 : C === 2 ? 30 : 45,
                D: D === 1 ? 15 : D === 2 ? 30 : 45
            };
            
            state.result = { archetype, sums, levels: { A, B, C, D } };
            
            // Hide landing, show results
            if (elements.landingScreen) {
                elements.landingScreen.style.display = 'none';
            }
            
            renderResults();
            return true;
        }
    }
    return false;
}

// Start assessment from landing screen
function startAssessment() {
    // Hide landing screen
    if (elements.landingScreen) {
        elements.landingScreen.style.display = 'none';
    }
    
    // Show compact header
    if (elements.compactHeader) {
        elements.compactHeader.style.display = 'block';
    }
    
    // Show progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.display = 'block';
    }
    
    // Show assessment section
    if (elements.assessmentSection) {
        elements.assessmentSection.style.display = 'block';
    }
    
    // Show navigation
    if (elements.questionNavigation) {
        elements.questionNavigation.style.display = 'flex';
    }
    
    // Track assessment started
    if (window.trackAssessmentStarted) {
        window.trackAssessmentStarted();
    }
    
    // Render first question
    renderAssessment();
}

// Randomize all responses for testing
function randomizeResponses() {
    state.responses = {};
    state.questions.forEach(q => {
        state.responses[q.id] = Math.floor(Math.random() * 5) + 1; // Random 1-5
    });
    
    // Calculate and show random result
    state.currentEmail = 'test@example.com';
    state.emailOptIn = false;
    calculateAndShowResults();
}

// Initialize app
async function init() {
    try {
        // Initialize DOM elements first
        initElements();
        
        // Load data
        await loadData();
        
        // Initialize analytics
        await initAnalytics();
        
        // Check for shared results in URL
        if (checkUrlParams()) {
            return;
        }
        
        // Initialize questions array
        state.questions = questions.questions.sort((a, b) => a.id - b.id);
        
        // Load saved progress (must be after questions are initialized)
        loadProgress();
        
        // Don't render assessment yet - show landing screen first
        // renderAssessment() and updateProgress() will be called by startAssessment()
        
        // Event listeners (check if elements exist first)
        if (elements.startBtn) {
            elements.startBtn.addEventListener('click', startAssessment);
        }
        
        if (elements.emailForm) {
            elements.emailForm.addEventListener('submit', handleEmailSubmit);
        }
        if (elements.submitBtn) {
            elements.submitBtn.addEventListener('click', handleSubmit);
        }
        if (elements.stickySubmitBtn) {
            elements.stickySubmitBtn.addEventListener('click', handleSubmit);
        }
        if (elements.retakeBtn) {
            elements.retakeBtn.addEventListener('click', retakeAssessment);
        }
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', prevQuestion);
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', handleNext);
        }
        
        if (elements.shareButtons && elements.shareButtons.length > 0) {
            Array.from(elements.shareButtons).forEach(btn => {
                if (btn && typeof btn.addEventListener === 'function') {
                    btn.addEventListener('click', (e) => {
                        const platform = e.target.dataset.platform;
                        if (platform === 'native') {
                            nativeShare();
                        } else {
                            shareResults(platform);
                        }
                    });
                }
            });
        }
        
        // Check for native share support
        if (navigator.share && elements.nativeShareBtn) {
            elements.nativeShareBtn.style.display = 'block';
            elements.nativeShareBtn.addEventListener('click', nativeShare);
        }
        
        // Keyboard shortcut for testing: 'r' key on results page randomizes
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && elements.resultsSection && elements.resultsSection.style.display === 'block') {
                randomizeResponses();
            }
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        if (elements.assessmentSection) {
            elements.assessmentSection.innerHTML = '<p>Error loading assessment. Please refresh the page.</p>';
        }
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

