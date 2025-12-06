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
    elements.archetypeDescriptionMobile = document.getElementById('archetypeDescriptionMobile');
    elements.archetypeDescriptionDesktop = document.getElementById('archetypeDescriptionDesktop');
    elements.archetypeImage = document.getElementById('archetypeImage');
    elements.domainCharts = document.getElementById('domainCharts');
    elements.mostCompatibleInfo = document.getElementById('mostCompatibleInfo');
    elements.leastCompatibleInfo = document.getElementById('leastCompatibleInfo');
    elements.mostCompatibleImage = document.getElementById('mostCompatibleImage');
    elements.leastCompatibleImage = document.getElementById('leastCompatibleImage');
    elements.shadowSide = document.getElementById('shadowSide');
    elements.growthPath = document.getElementById('growthPath');
    elements.shareButtons = document.querySelectorAll('.share-btn');
    elements.nativeShareBtn = document.getElementById('nativeShareBtn');
    elements.resetLink = document.getElementById('resetLink');
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

// Calculate scale scores
function calculateScales() {
    const scores = {};
    
    config.scales.forEach(scale => {
        let sum = 0;
        scale.questionIds.forEach(qid => {
            const answer = state.responses[qid];
            if (answer && answer >= 1 && answer <= 5) {
                sum += answer;
            }
        });
        scores[scale.id] = sum;
    });
    
    return scores;
}

// Classify archetype based on new decision tree
function classifyArchetype(scores, responses) {
    // Helper to get response value (default 0 if missing)
    const getResp = (id) => responses[id] || 0;
    
    // 1. Mystery Mosaic (MM)
    if (scores.Disorganization >= 15) {
        // Subtype check: The Shrinker
        if (scores.Shrinking_Response >= 8) {
            return archetypes.archetypes.find(a => a.id === 9); // The Shrinker
        }
        return archetypes.archetypes.find(a => a.id === 4); // Mystery Mosaic
    }
    
    // 2. Grounded Navigator (GN)
    if (scores.Secure_Foundation >= 36 && 
        scores.Attachment_Anxiety < 15 && 
        scores.Attachment_Avoidance < 17) {
        return archetypes.archetypes.find(a => a.id === 1);
    }
    
    // 3. Heartfelt Defender (HD) - Check both Core and Performer logic
    // Core: Anxiety >= 25, Shame >= 18, Performance >= 11
    // Performer: Anxiety >= 25, Performance >= 11, Shame [11, 17]
    if (scores.Attachment_Anxiety >= 25) {
        if (scores.Performance_Defense >= 11) {
            if (scores.Shame_Intensity >= 18) {
                return archetypes.archetypes.find(a => a.id === 5); // Heartfelt Defender (Core)
            }
            if (scores.Shame_Intensity >= 11 && scores.Shame_Intensity <= 17) {
                return archetypes.archetypes.find(a => a.id === 10); // The Performer
            }
        }
        
        // Also check if it matches HD criteria generally if above specific checks fail? 
        // The text says "Heartfelt Defender (core): Anxiety >= 25, Shame >= 18, Performance >= 11"
        // I'll stick to the strict checks.
        // Wait, if it matches HD core but not Performer, it returns HD.
        
        // Let's re-read the priority list.
        // 3. HD Core
        if (scores.Shame_Intensity >= 18 && scores.Performance_Defense >= 11) {
             return archetypes.archetypes.find(a => a.id === 5);
        }
        // 4. HD Performer
        if (scores.Performance_Defense >= 11 && scores.Shame_Intensity >= 11 && scores.Shame_Intensity <= 17) {
             return archetypes.archetypes.find(a => a.id === 10);
        }
        
        // 5. Passionate Pilgrim (PP)
        // Anxiety >= 25 AND Q11 >= 4 AND Q23 >= 4
        if (getResp(11) >= 4 && getResp(23) >= 4) {
             return archetypes.archetypes.find(a => a.id === 7);
        }
        
        // 6. Emotional Enthusiast (EE)
        // Anxiety >= 25 (Catch all for high anxiety if above don't match)
        return archetypes.archetypes.find(a => a.id === 2);
    }
    
    // 7. Chill Conductor (CC)
    if (scores.Attachment_Avoidance >= 29 && scores.Intellectual_Avoidance >= 8) {
        return archetypes.archetypes.find(a => a.id === 6);
    }
    
    // 8. Independent Icon (II)
    if (scores.Attachment_Avoidance >= 29 && getResp(10) >= 4 && getResp(35) >= 4) {
        return archetypes.archetypes.find(a => a.id === 8);
    }
    
    // 9. Lone Wolf (LW)
    if (scores.Attachment_Avoidance >= 29) {
        return archetypes.archetypes.find(a => a.id === 3);
    }
    
    // 10. Default: Grounded Navigator
    return archetypes.archetypes.find(a => a.id === 1);
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
    const percentage = (questionNumber / total) * 100;
    
    // Update progress text and bar
    elements.progressText.textContent = `Question ${questionNumber} of ${total}`;
    elements.progressFill.style.width = `${percentage}%`;
    
    // Update domain category header - REMOVED in new version as questions are not grouped by display domain
    if (elements.domainCategoryHeader) {
        elements.domainCategoryHeader.style.display = 'none';
    }
    /*
    if (currentQuestion) {
        // Old domain logic
        const domain = config.domains.find(d => d.id === currentQuestion.domain);
        if (domain) {
            elements.domainCategoryTitle.textContent = domain.name;
            elements.domainCategoryDescription.textContent = domain.description;
            elements.domainCategoryHeader.style.display = 'block';
        }
    }
    */
    
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
    
    // Auto-advance on mobile (screen width <= 768px)
    if (window.innerWidth <= 768) {
        // Small delay for visual feedback
        setTimeout(() => {
            nextQuestion();
        }, 300);
    }
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
async function sendResultsEmail(email, optIn, archetype, scores, scaleLevels) {
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
        scores: scores,
        scaleLevels: scaleLevels,
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
    const scores = calculateScales();
    
    // Calculate levels for display/email
    const scaleLevels = {};
    config.scales.forEach(scale => {
        const sum = scores[scale.id];
        if (sum >= scale.levels.high.min) scaleLevels[scale.id] = 'high';
        else if (sum >= scale.levels.moderate.min) scaleLevels[scale.id] = 'moderate';
        else scaleLevels[scale.id] = 'low';
    });
    
    const archetype = classifyArchetype(scores, state.responses);
    state.result = { archetype, scores, scaleLevels };
    
    // Track assessment completed
    if (window.trackAssessmentCompleted) {
        window.trackAssessmentCompleted(archetype.id, archetype.name);
    }
    
    if (window.trackArchetypeResult) {
        window.trackArchetypeResult(archetype.id, archetype.name);
    }
    
    // Send email with results
    sendResultsEmail(state.currentEmail, state.emailOptIn, archetype, scores, scaleLevels);
    
    renderResults();
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Render results
function renderResults() {
    const { archetype, scores, scaleLevels } = state.result;
    
    // Archetype info
    elements.archetypeName.textContent = `You are ${archetype.name}`;
    elements.archetypeTag.textContent = archetype.shortTag;
    
    // Use expanded description if available, fallback to short description
    const description = archetype.expandedDescription || archetype.description;
    
    // Set description in both mobile and desktop locations
    if (elements.archetypeDescriptionMobile) {
        elements.archetypeDescriptionMobile.textContent = description;
    }
    if (elements.archetypeDescriptionDesktop) {
        elements.archetypeDescriptionDesktop.textContent = description;
    }
    
    // Archetype image - match actual file names
    const imageName = archetype.name.toLowerCase()
        .replace(/\s+/g, '-');
    // Note: Image paths might need update if new images are not available. 
    // For now keeping same logic, hoping images exist or fallback.
    const imagePath = `./assets/images/archetype-${archetype.id}-${imageName}.png`;
    elements.archetypeImage.src = imagePath;
    elements.archetypeImage.alt = archetype.name;
    
    // Domain charts (now Scale charts)
    elements.domainCharts.innerHTML = '';
    config.scales.forEach(scale => {
        const sum = scores[scale.id];
        const level = scaleLevels[scale.id]; // 'low', 'moderate', 'high'
        
        // Calculate percentage based on min/max of the scale
        const percentage = ((sum - scale.min) / (scale.max - scale.min)) * 100;
        
        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = scale.name;
        
        const visual = document.createElement('div');
        visual.className = 'chart-visual';
        
        const fill = document.createElement('div');
        fill.className = 'chart-fill';
        fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        
        // Optional: Color code based on level
        if (level === 'high') fill.classList.add('level-high');
        else if (level === 'moderate') fill.classList.add('level-moderate');
        else fill.classList.add('level-low');
        
        visual.appendChild(fill);
        
        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = `${sum}`;
        
        chartBar.appendChild(label);
        chartBar.appendChild(visual);
        chartBar.appendChild(value);
        elements.domainCharts.appendChild(chartBar);
    });
    
    // Compatibility (Hidden for now as data structure changed/is incomplete)
    // If you want to show it, need to ensure data exists in archetypes.json
    /*
    const mostCompatible = archetypes.archetypes.find(a => a.name === archetype.mostCompatible);
    const leastCompatible = archetypes.archetypes.find(a => a.name === archetype.leastCompatible);
    
    if (elements.mostCompatibleInfo && mostCompatible) {
        elements.mostCompatibleInfo.textContent = mostCompatible.name;
        if (elements.mostCompatibleImage) {
            const compatImageName = mostCompatible.name.toLowerCase().replace(/\s+/g, '-');
            elements.mostCompatibleImage.src = `assets/images/archetype-${mostCompatible.id}-${compatImageName}.png`;
            elements.mostCompatibleImage.alt = mostCompatible.name;
        }
    }
    
    if (elements.leastCompatibleInfo && leastCompatible) {
        elements.leastCompatibleInfo.textContent = leastCompatible.name;
        if (elements.leastCompatibleImage) {
            const challengeImageName = leastCompatible.name.toLowerCase().replace(/\s+/g, '-');
            elements.leastCompatibleImage.src = `assets/images/archetype-${leastCompatible.id}-${challengeImageName}.png`;
            elements.leastCompatibleImage.alt = leastCompatible.name;
        }
    }
    */
    // Hide compatibility sections if they exist in DOM but we don't have data
    if (elements.mostCompatibleInfo) elements.mostCompatibleInfo.parentElement.style.display = 'none';
    if (elements.leastCompatibleInfo) elements.leastCompatibleInfo.parentElement.style.display = 'none';

    
    // Shadow Side and Growth Path
    if (elements.shadowSide && archetype.shadowSide) {
        elements.shadowSide.textContent = archetype.shadowSide;
    }
    
    if (elements.growthPath && archetype.growthPath) {
        elements.growthPath.textContent = archetype.growthPath;
    }
    
    // Update meta tags for sharing
    updateMetaTags(archetype);
    
    // Show results section
    elements.resultsSection.style.display = 'block';
    elements.assessmentSection.style.display = 'none';
    
    if (elements.questionNavigation) {
        elements.questionNavigation.style.display = 'none';
    }
    if (elements.domainCategoryHeader) {
        elements.domainCategoryHeader.style.display = 'none';
    }
    if (elements.submitButtonContainer) {
        elements.submitButtonContainer.style.display = 'none';
    }
    if (elements.stickyButton) {
        elements.stickyButton.style.display = 'none';
    }
    
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
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
    
    // Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);
    
    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);
    
    // Update URL with encoded results
    const url = new URL(window.location.href);
    url.searchParams.set('archetype', archetype.id);
    // Removed specific levels params
    
    window.history.replaceState({}, '', url);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url.toString());
}

// Share functionality
function shareResults(platform) {
    console.log('shareResults called with platform:', platform);
    
    if (!state.result || !state.result.archetype) {
        console.error('No result available to share');
        return;
    }
    
    const archetype = state.result.archetype;
    const shareUrl = window.location.href;
    const shareText = `I'm ${archetype.name} - ${archetype.tag}. Discover your Realness Score!`;
    
    console.log('Sharing:', { platform, archetype: archetype.name, url: shareUrl });
    
    // Track sharing
    if (window.trackResultsShared) {
        window.trackResultsShared(platform, archetype.id, archetype.name);
    }
    
    switch (platform) {
        case 'twitter':
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=RealnessScore`;
            console.log('Opening Twitter:', twitterUrl);
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            break;
        case 'facebook':
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            console.log('Opening Facebook:', fbUrl);
            window.open(fbUrl, '_blank', 'width=600,height=400');
            break;
        case 'linkedin':
            const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            console.log('Opening LinkedIn:', liUrl);
            window.open(liUrl, '_blank', 'width=600,height=400');
            break;
        case 'copy':
            navigator.clipboard.writeText(shareUrl).then(() => {
                console.log('Link copied to clipboard');
                const btn = event.target;
                if (btn) {
                    const originalText = btn.textContent;
                    btn.textContent = '✓ Link Copied!';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Link: ' + shareUrl);
            });
            break;
        default:
            console.error('Unknown platform:', platform);
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

// Retake assessment - complete reset
function retakeAssessment() {
    // Clear ALL data
    clearProgress();
    state.result = null;
    state.currentQuestionIndex = 0;
    state.emailCollected = false;
    state.responses = {};
    
    // Clear ALL localStorage
    localStorage.clear();
    
    // Clear URL params
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    
    // Hide everything
    if (elements.resultsSection) elements.resultsSection.style.display = 'none';
    if (elements.assessmentSection) elements.assessmentSection.style.display = 'none';
    if (elements.questionNavigation) elements.questionNavigation.style.display = 'none';
    if (elements.domainCategoryHeader) elements.domainCategoryHeader.style.display = 'none';
    if (elements.submitButtonContainer) elements.submitButtonContainer.style.display = 'none';
    if (elements.stickyButton) elements.stickyButton.style.display = 'none';
    if (elements.errorBanner) elements.errorBanner.style.display = 'none';
    if (elements.compactHeader) elements.compactHeader.style.display = 'none';
    if (elements.emailModal) elements.emailModal.style.display = 'none';
    
    // Hide progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.display = 'none';
    }
    
    // Show landing screen
    if (elements.landingScreen) {
        elements.landingScreen.style.display = 'flex';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            // Simplified: just show archetype, no charts if scores missing
            state.result = { 
                archetype, 
                scores: {}, 
                scaleLevels: {} 
            };
            
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
        
        // Reset link in footer (copyright link)
        if (elements.resetLink) {
            elements.resetLink.addEventListener('click', (e) => {
                e.preventDefault();
                retakeAssessment();
            });
        }
        
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', prevQuestion);
        }
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', handleNext);
        }
        
        if (elements.shareButtons && elements.shareButtons.length > 0) {
            console.log('Setting up share buttons:', elements.shareButtons.length);
            Array.from(elements.shareButtons).forEach(btn => {
                if (btn && typeof btn.addEventListener === 'function') {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const platform = e.currentTarget.dataset.platform;
                        console.log('Share button clicked:', platform);
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

