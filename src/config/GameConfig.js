export const DIFFICULTY_SETTINGS = {
  Easy: {
    monsterSpawnInterval: 5000,
    monsterSpeedBase: 50,
    maxMonsters: 3,
    availableOperations: ['addition']
  },
  Medium: {
    monsterSpawnInterval: 4000,
    monsterSpeedBase: 70,
    maxMonsters: 4,
    availableOperations: ['addition', 'subtraction']
  },
  Hard: {
    monsterSpawnInterval: 3000,
    monsterSpeedBase: 90,
    maxMonsters: 5,
    availableOperations: ['addition', 'subtraction', 'multiplication']
  }
};

// Add presets for game rules based on old XML format
export const GAME_RULES_PRESETS = {
  Easy: {
    speedMin: 20,
    speedStartDelay: 60000, // 60 seconds
    speedInc: 10,
    speedEvery: 20000, // 20 seconds
    speedMax: 40,
    monstersToUse: ['monster1', 'monster2'],
    monstersMin: 1,
    monstersStartDelay: 0,
    monstersInc: 1,
    monstersEvery: 60000, // 60 seconds
    monstersMax: 3,
    lessionType: 2, // Addition
    lessionMinValue: 1,
    lessionMaxValue: 10
  },
  Medium: {
    speedMin: 30,
    speedStartDelay: 40000, // 40 seconds
    speedInc: 15,
    speedEvery: 20000, // 20 seconds
    speedMax: 60,
    monstersToUse: ['monster1', 'monster2', 'badpig'],
    monstersMin: 2,
    monstersStartDelay: 0,
    monstersInc: 1,
    monstersEvery: 40000, // 40 seconds
    monstersMax: 5,
    lessionType: 1, // Random multiplication
    lessionMinValue: 2,
    lessionMaxValue: 10
  },
  Hard: {
    speedMin: 40,
    speedStartDelay: 20000, // 20 seconds
    speedInc: 20,
    speedEvery: 15000, // 15 seconds
    speedMax: 80,
    monstersToUse: ['monster1', 'monster2', 'badpig'],
    monstersMin: 3,
    monstersStartDelay: 0,
    monstersInc: 2,
    monstersEvery: 30000, // 30 seconds
    monstersMax: 8,
    lessionType: 3, // Subtraction
    lessionMinValue: 10,
    lessionMaxValue: 30,
    lessionAllowNegativeResult: false
  }
};

// Storage key for custom rules
const CUSTOM_RULES_STORAGE_KEY = 'mathMonsterCustomRules';

// Save custom rules to localStorage
export function saveCustomRules(rules) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_RULES_STORAGE_KEY, JSON.stringify(rules));
      return true;
    } catch (error) {
      console.error('Failed to save custom rules:', error);
      return false;
    }
  }
  return false;
}

// Load custom rules from localStorage
export function loadCustomRules() {
  if (typeof localStorage !== 'undefined') {
    try {
      const storedRules = localStorage.getItem(CUSTOM_RULES_STORAGE_KEY);
      if (storedRules) {
        return JSON.parse(storedRules);
      }
    } catch (error) {
      console.error('Failed to load custom rules:', error);
    }
  }
  return null;
}

// Convert rules to XML format for legacy code compatibility
export function convertRulesToXML(rules) {
  // Create lesson tag based on lesson type
  let lessonTag = '';
  switch (rules.lessionType) {
    case 0: // MULTIPLY_TABLE
      lessonTag = `<lession type="multiply_table" table="${rules.lessionMultiplyTable}">`;
      break;
    case 1: // MULTIPLY_RANDOM
      lessonTag = `<lession type="multiply_random" min="${rules.lessionMinValue}" max="${rules.lessionMaxValue}">`;
      break;
    case 2: // ADDITION_RANDOM
      lessonTag = `<lession type="addition_random" min="${rules.lessionMinValue}" max="${rules.lessionMaxValue}">`;
      break;
    case 3: // SUBSTRACTION_RANDOM
      lessonTag = `<lession type="substraction_random" min="${rules.lessionMinValue}" max="${rules.lessionMaxValue}" allownegativeresult="${rules.lessionAllowNegativeResult || false}">`;
      break;
  }

  // Create the full XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rules>
  <speed min="${rules.speedMin}" startdelay="${rules.speedStartDelay}" increment="${rules.speedInc}" every="${rules.speedEvery}" max="${rules.speedMax}"/>
  <monsters list="['${rules.monstersToUse.join("','")}']" min="${rules.monstersMin}" startdelay="${rules.monstersStartDelay}" increment="${rules.monstersInc}" every="${rules.monstersEvery}" max="${rules.monstersMax}"/>
  ${lessonTag}
</rules>`;

  return xml;
}

// Get rule set based on difficulty or custom rules
export function getRulesByDifficulty(difficulty) {
  const customRules = loadCustomRules();
  
  if (difficulty === 'Custom' && customRules) {
    return customRules;
  }
  
  return GAME_RULES_PRESETS[difficulty] || GAME_RULES_PRESETS.Medium;
}

export const OPERATION_RANGES = {
  addition: {
    Easy: { min1: 1, max1: 10, min2: 1, max2: 10 },
    Medium: { min1: 5, max1: 20, min2: 5, max2: 20 },
    Hard: { min1: 10, max1: 50, min2: 10, max2: 50 }
  },
  subtraction: {
    Easy: { min1: 5, max1: 20, min2: 1, max2: null }, // max2 is dynamically set to num1
    Medium: { min1: 10, max1: 50, min2: 1, max2: null },
    Hard: { min1: 25, max1: 100, min2: 1, max2: null }
  },
  multiplication: {
    Easy: { min1: 1, max1: 5, min2: 1, max2: 5 },
    Medium: { min1: 2, max1: 10, min2: 2, max2: 10 },
    Hard: { min1: 5, max1: 12, min2: 5, max2: 12 }
  }
};

export const MONSTER_TYPES = ['monster1', 'monster2', 'badpig'];

// Game progression settings
export const GAME_PROGRESSION = {
  speedIncreaseInterval: 30000, // ms
  speedIncreaseAmount: 10,
  spawnIntervalDecreaseAmount: 500,
  minimumSpawnInterval: 1000,
  speedMultiplierPerMinute: 0.5
};

// Points for defeating monsters
export const POINTS = {
  standard: 10,
  // Could add more point types for different monster types or difficulties
};

// Sound settings
export const SOUND_CONFIG = {
  music: { volume: 0.2, loop: true },
  effects: { volume: 0.2 }
};

// Game styles for consistent UI
export const UI_STYLES = {
  title: {
    fontFamily: 'Arial',
    fontSize: 56,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 8,
    fontStyle: 'bold'
  },
  subtitle: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 5,
    align: 'center',
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#000000',
      blur: 5,
      fill: true
    }
  },
  score: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
    fontStyle: 'bold'
  },
  button: {
    fontFamily: 'Arial',
    fontSize: 42,
    color: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 40, right: 40, top: 25, bottom: 25 },
    shadow: {
      offsetX: 3,
      offsetY: 3,
      color: '#000000',
      blur: 5,
      fill: true
    }
  },
  problemText: {
    fontFamily: 'Arial',
    fontSize: 40,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
  }
};

// Game object dimensions and positioning
export const LAYOUT = {
  // Calculate game over line position based on screen height and orientation
  gameOverLine: (height, isLandscape) => {
    // Use the same percentage for both orientations to ensure consistent timing
    return height * 0.75; // 75% from the top in both orientations
  },

  // Calculate numpad sizes based on screen dimensions and orientation
  numpadSize: (width, height, isLandscape) => {
    if (isLandscape) {
      // In landscape: use consistent button sizing scaled to screen
      return Math.min(width / 20, height / 6);
    } else {
      // In portrait: use slightly larger buttons but still scaled proportionally
      return Math.min(width / 8, height / 12);
    }
  },

  // Get monster speed multiplier to ensure consistent speed regardless of orientation
  speedMultiplier: (isLandscape) => {
    return isLandscape ? 0.8 : 1; // Reduce speed in landscape to match portrait timing
  },

  // Calculate UI scales for consistent appearance across devices
  getUIScale: (width, height) => {
    // Base scale on the smaller dimension to ensure visibility
    const baseScale = Math.min(width / 1024, height / 768);
    // Adjust scale for very small screens to keep UI elements visible
    return Math.max(0.5, baseScale);
  },

  // Calculate positions for mobile UI elements
  mobileLayout: {
    // Numpad positioning percentages for different orientations
    numpad: {
      landscape: {
        xStart: 0.65, // Start at 65% of screen width
        yStart: 0.6,  // Start at 60% of screen height
        spacing: 1.2  // Button spacing multiplier
      },
      portrait: {
        xStart: 0.5,  // Center of screen
        yStart: 0.8,  // 80% of screen height
        spacing: 1.2  // Button spacing multiplier
      }
    }
  }
}; 