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

// DOM elements
const elements = {
    assessmentSection: document.getElementById('assessmentSection'),
    resultsSection: document.getElementById('resultsSection'),
    progressText: document.getElementById('progressText'),
    progressFill: document.getElementById('progressFill'),
    domainCategoryHeader: document.getElementById('domainCategoryHeader'),
    domainCategoryTitle: document.getElementById('domainCategoryTitle'),
    domainCategoryDescription: document.getElementById('domainCategoryDescription'),
    errorBanner: document.getElementById('errorBanner'),
    emailModal: document.getElementById('emailModal'),
    emailForm: document.getElementById('emailForm'),
    emailInput: document.getElementById('emailInput'),
    questionNavigation: document.getElementById('questionNavigation'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    submitBtn: document.getElementById('submitBtn'),
    submitButtonContainer: document.getElementById('submitButtonContainer'),
    stickyButton: document.getElementById('stickyButton'),
    stickySubmitBtn: document.getElementById('stickySubmitBtn'),
    retakeBtn: document.getElementById('retakeBtn'),
    archetypeName: document.getElementById('archetypeName'),
    archetypeTag: document.getElementById('archetypeTag'),
    archetypeDescription: document.getElementById('archetypeDescription'),
    archetypeImage: document.getElementById('archetypeImage'),
    domainCharts: document.getElementById('domainCharts'),
    compatibilityInfo: document.getElementById('compatibilityInfo'),
    imagePromptText: document.getElementById('imagePromptText'),
    copyPromptBtn: document.getElementById('copyPromptBtn'),
    shareButtons: document.querySelectorAll('.share-btn'),
    nativeShareBtn: document.getElementById('nativeShareBtn')
};

// Initialize analytics
async function initAnalytics() {
    try {
        const analyticsModule = await import('./utils/analytics.js');
        if (analyticsModule.initAnalytics) {
            analyticsModule.initAnalytics();
        }
        
        // Make analytics functions available globally
        window.trackAssessmentStarted = analyticsModule.trackAssessmentStarted || (() => {});
        window.trackAssessmentCompleted = analyticsModule.trackAssessmentCompleted || (() => {});
        window.trackEmailCollected = analyticsModule.trackEmailCollected || (() => {});
        window.trackResultsShared = analyticsModule.trackResultsShared || (() => {});
        window.trackArchetypeResult = analyticsModule.trackArchetypeResult || (() => {});
        window.trackQuestionAnswered = analyticsModule.trackQuestionAnswered || (() => {});
        window.trackDomainCompleted = analyticsModule.trackDomainCompleted || (() => {});
    } catch (error) {
        console.warn('Analytics initialization failed:', error);
        // Create no-op functions
        window.trackAssessmentStarted = () => {};
        window.trackAssessmentCompleted = () => {};
        window.trackEmailCollected = () => {};
        window.trackResultsShared = () => {};
        window.trackArchetypeResult = () => {};
        window.trackQuestionAnswered = () => {};
        window.trackDomainCompleted = () => {};
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
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    if (!email || !isValidEmail(email)) {
        elements.emailInput.focus();
        return;
    }
    
    state.currentEmail = email;
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
        .replace(/the /g, '')
        .replace(/\s+/g, '-');
    const imagePath = `assets/images/archetype-${archetype.id}-${imageName}.png`;
    elements.archetypeImage.src = imagePath;
    elements.archetypeImage.alt = archetype.name;
    
    // Image prompt
    elements.imagePromptText.value = archetype.imagePrompt;
    
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
        value.textContent = `${sum} (Level ${level})`;
        
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

// Copy image prompt
function copyImagePrompt() {
    elements.imagePromptText.select();
    document.execCommand('copy');
    
    const originalText = elements.copyPromptBtn.textContent;
    elements.copyPromptBtn.textContent = 'Copied!';
    setTimeout(() => {
        elements.copyPromptBtn.textContent = originalText;
    }, 2000);
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
            renderResults();
            return true;
        }
    }
    return false;
}

// Initialize app
async function init() {
    try {
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
        
        // Render assessment
        renderAssessment();
        updateProgress();
        
        // Event listeners
        elements.emailForm.addEventListener('submit', handleEmailSubmit);
        elements.submitBtn.addEventListener('click', handleSubmit);
        elements.stickySubmitBtn.addEventListener('click', handleSubmit);
        elements.retakeBtn.addEventListener('click', retakeAssessment);
        elements.copyPromptBtn.addEventListener('click', copyImagePrompt);
        elements.prevBtn.addEventListener('click', prevQuestion);
        elements.nextBtn.addEventListener('click', handleNext);
        
        elements.shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.dataset.platform;
                if (platform === 'native') {
                    nativeShare();
                } else {
                    shareResults(platform);
                }
            });
        });
        
        // Check for native share support
        if (navigator.share) {
            elements.nativeShareBtn.style.display = 'block';
            elements.nativeShareBtn.addEventListener('click', nativeShare);
        }
        
        // Track assessment started
        if (typeof trackAssessmentStarted === 'function') {
            trackAssessmentStarted();
        }
        
    } catch (error) {
        console.error('Error initializing app:', error);
        elements.assessmentSection.innerHTML = '<p>Error loading assessment. Please refresh the page.</p>';
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

