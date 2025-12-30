// Terrain Scoring Algorithm with Override Logic
// Implements: Core Scoring, Disorganized Override, Secure-First Override, Tiebreaker

import { SCORING_CONFIG, ARCHETYPE_MAP, ARCHETYPE_NAMES } from './terrain-data.js';

/**
 * Validate terrain assessment answers
 * @param {Object} answers - Map of questionId -> {first, second, least}
 * @returns {Object} {valid: boolean, errors: string[]}
 */
function validateAnswers(answers) {
  const errors = [];
  const validOptions = ['A', 'B', 'C', 'D'];

  // Check we have all 8 questions (q1-q8)
  const expectedQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];
  const actualQuestions = Object.keys(answers);

  for (const qId of expectedQuestions) {
    if (!answers[qId]) {
      errors.push(`Missing answer for ${qId}`);
      continue;
    }

    const answer = answers[qId];

    // Check all three selections present
    if (!answer.first) {
      errors.push(`${qId}: Missing first choice`);
    }
    if (!answer.second) {
      errors.push(`${qId}: Missing second choice`);
    }
    if (!answer.least) {
      errors.push(`${qId}: Missing least choice`);
    }

    // Check all selections are valid options
    if (answer.first && !validOptions.includes(answer.first)) {
      errors.push(`${qId}: Invalid first choice '${answer.first}'`);
    }
    if (answer.second && !validOptions.includes(answer.second)) {
      errors.push(`${qId}: Invalid second choice '${answer.second}'`);
    }
    if (answer.least && !validOptions.includes(answer.least)) {
      errors.push(`${qId}: Invalid least choice '${answer.least}'`);
    }

    // Check all three selections are different
    const selections = [answer.first, answer.second, answer.least].filter(Boolean);
    const unique = new Set(selections);
    if (selections.length === 3 && unique.size !== 3) {
      errors.push(`${qId}: All three selections must be different`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate Terrain from 8 question responses
 * @param {Object} answers - Map of questionId -> {first, second, least}
 * @param {String} probingAnswer - Optional probing question answer ('A'|'B'|'C'|'D')
 * @returns {Object} Terrain profile with scores, archetype, flags
 */
export function calculateTerrain(answers, probingAnswer = null) {
  // Step 0: Validate input
  const validation = validateAnswers(answers);
  if (!validation.valid) {
    throw new Error(`Invalid terrain answers: ${validation.errors.join(', ')}`);
  }

  // Step 1: Tally points
  const scores = tallyScores(answers);

  // Step 2: Check for Disorganized Override (PRIORITY 1)
  const disorganizedOverride = checkDisorganizedOverride(answers);
  if (disorganizedOverride.triggered) {
    return buildTerrainProfile('Disorganized', null, scores, answers, {
      hidden_disorganized: true,
      masked_fragmentation: true
    }, probingAnswer);
  }

  // Step 3: Check for Secure-First Override (PRIORITY 2)
  const secureFirstOverride = checkSecureFirstOverride(answers, scores);
  if (secureFirstOverride.triggered) {
    if (secureFirstOverride.useProbing && probingAnswer) {
      // Use probing answer to determine true terrain
      const probingCategory = getCategoryFromOption(probingAnswer);
      return buildTerrainProfile(probingCategory, 'Secure', scores, answers, {
        regulated_presentation: true,
        confirmed_secure: false
      }, probingAnswer);
    } else if (secureFirstOverride.secondaryTerrain) {
      // Clear secondary pattern detected - user is NOT truly secure
      return buildTerrainProfile(secureFirstOverride.secondaryTerrain, 'Secure', scores, answers, {
        regulated_presentation: true,
        confirmed_secure: false
      }, probingAnswer);
    }
  }

  // Step 4: Standard Scoring
  const primary = getPrimaryTerrain(scores);
  const secondary = getSecondaryTerrain(scores, primary);

  return buildTerrainProfile(primary, secondary, scores, answers, {}, probingAnswer);
}

/**
 * Tally points across all 8 questions
 */
function tallyScores(answers) {
  const scores = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  const repulsionScores = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  Object.values(answers).forEach(answer => {
    if (!answer.first || !answer.second || !answer.least) return;

    // Add points for first and second choices
    const firstCategory = getCategoryFromOption(answer.first);
    const secondCategory = getCategoryFromOption(answer.second);
    const leastCategory = getCategoryFromOption(answer.least);

    scores[firstCategory] += SCORING_CONFIG.firstChoiceWeight;
    scores[secondCategory] += SCORING_CONFIG.secondChoiceWeight;

    // Track repulsion
    repulsionScores[leastCategory] += 1;
  });

  return { scores, repulsionScores };
}

/**
 * Override 1: Disorganized Detection (Hidden Fragmentation)
 * Triggered when user oscillates between Anxious/Avoidant on 3+ questions
 */
function checkDisorganizedOverride(answers) {
  let oscillationCount = 0;

  Object.values(answers).forEach(answer => {
    if (!answer.first || !answer.second) return;

    const first = getCategoryFromOption(answer.first);
    const second = getCategoryFromOption(answer.second);

    // Check for oscillation pattern
    const isOscillation =
      (first === 'Anxious' && second === 'Avoidant') ||
      (first === 'Avoidant' && second === 'Anxious');

    if (isOscillation) {
      oscillationCount++;
    }
  });

  return {
    triggered: oscillationCount >= SCORING_CONFIG.disorganizedOscillationThreshold,
    oscillationCount
  };
}

/**
 * Override 2: Secure-First Override (Aspirational Bias Detection)
 * Triggered when user selects Secure as 1st choice on 6+ questions
 */
function checkSecureFirstOverride(answers, { scores: rawScores }) {
  let secureFirstCount = 0;
  const secondChoices = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  Object.values(answers).forEach(answer => {
    if (!answer.first || !answer.second) return;

    const first = getCategoryFromOption(answer.first);
    const second = getCategoryFromOption(answer.second);

    if (first === 'Secure') {
      secureFirstCount++;
    }

    secondChoices[second]++;
  });

  if (secureFirstCount < SCORING_CONFIG.secureFirstThreshold) {
    return { triggered: false };
  }

  // Analyze 2nd choices for pattern
  const secondaryPattern = Object.entries(secondChoices)
    .filter(([category, count]) => category !== 'Secure' && count >= SCORING_CONFIG.secondaryPatternThreshold)
    .sort((a, b) => b[1] - a[1])[0];

  if (secondaryPattern) {
    // Clear secondary pattern found
    return {
      triggered: true,
      secondaryTerrain: secondaryPattern[0],
      useProbing: false
    };
  }

  // No clear pattern - need probing question
  return {
    triggered: true,
    useProbing: true,
    secondaryTerrain: null
  };
}

/**
 * Get Primary Terrain (highest score)
 */
function getPrimaryTerrain({ scores }) {
  const entries = Object.entries(scores);

  // Check for ties
  const maxScore = Math.max(...entries.map(([_, score]) => score));
  const tied = entries.filter(([_, score]) => score === maxScore);

  if (tied.length > 1) {
    // Use tiebreaker priority
    for (const priority of SCORING_CONFIG.tiebreakerPriority) {
      if (tied.some(([category]) => category === priority)) {
        return priority;
      }
    }
  }

  return entries.reduce((max, [category, score]) =>
    score > scores[max] ? category : max
  , 'Secure');
}

/**
 * Get Secondary Terrain (second-highest score, excluding primary)
 */
function getSecondaryTerrain({ scores }, primary) {
  const filtered = Object.entries(scores)
    .filter(([category]) => category !== primary)
    .sort((a, b) => b[1] - a[1]);

  return filtered.length > 0 ? filtered[0][0] : null;
}

/**
 * Map option letter to category
 */
function getCategoryFromOption(option) {
  const mapping = {
    'A': 'Anxious',
    'B': 'Avoidant',
    'C': 'Secure',
    'D': 'Disorganized'
  };
  return mapping[option] || 'Secure';
}

/**
 * Build complete Terrain Profile object
 */
function buildTerrainProfile(primary, secondary, { scores, repulsionScores }, answers, flags, probingAnswer) {
  // Determine archetype
  let archetypeKey;
  if (primary === 'Secure') {
    archetypeKey = 'Secure';
  } else if (primary === 'Disorganized') {
    archetypeKey = 'Disorganized';
  } else {
    archetypeKey = secondary ? `${primary}-${secondary}` : primary;
  }

  const archetypeCode = ARCHETYPE_MAP[archetypeKey] || 'GN';
  const archetypeName = ARCHETYPE_NAMES[archetypeCode];

  return {
    userId: null, // Set later
    primary_terrain: primary,
    secondary_terrain: secondary,
    archetype: archetypeCode,
    archetype_display_name: archetypeName,
    flags: {
      hidden_disorganized: false,
      masked_fragmentation: false,
      confirmed_secure: false,
      regulated_presentation: false,
      ...flags
    },
    scores,
    repulsion_scores: repulsionScores,
    onboarding_answers: answers,
    completed_at: new Date().toISOString(),
    version: 1,
    probing_question_triggered: !!probingAnswer,
    probing_question_answer: probingAnswer
  };
}

/**
 * Check if Probing Question is needed
 * (Used in UI to determine if we should show probing question)
 */
export function needsProbingQuestion(answers) {
  const scores = tallyScores(answers);
  const secureFirstOverride = checkSecureFirstOverride(answers, scores);
  return secureFirstOverride.triggered && secureFirstOverride.useProbing;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomize question options to prevent pattern guessing
 * Creates a new shuffled copy of options array for each question
 * @param {Array} questions - Array of TERRAIN_QUESTIONS
 * @returns {Array} Questions with shuffled options
 */
export function randomizeQuestionOptions(questions) {
  return questions.map(question => ({
    ...question,
    options: shuffleArray(question.options)
  }));
}
