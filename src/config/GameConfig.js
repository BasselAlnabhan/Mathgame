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
  gameOverLine: (height) => height - 150
}; 