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
    fontSize: 48,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  },
  subtitle: {
    fontFamily: 'Arial',
    fontSize: 24,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4,
    align: 'center'
  },
  score: {
    fontFamily: 'Arial',
    fontSize: 24,
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
  },
  button: {
    fontFamily: 'Arial',
    fontSize: 36,
    color: '#ffffff',
    padding: { left: 30, right: 30, top: 20, bottom: 20 }
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