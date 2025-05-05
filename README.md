# Math Monster Game

A fun educational game where players solve math problems to defeat descending monsters before they reach the bottom of the screen.

## Game Overview

Math Monster Game is built with Phaser 3 and offers a challenging educational experience where players practice arithmetic skills while having fun. The game features:

- Three difficulty levels (Easy, Medium, Hard)
- Different types of math problems (addition, subtraction, multiplication)
- Increasing difficulty as the game progresses
- Animated monsters that descend with math problems
- Sound effects and background music

## How to Play

1. Choose a difficulty level
2. Solve the math problem displayed on each monster
3. Type your answer and press Enter
4. Prevent monsters from reaching the bottom of the screen

## Technologies Used

- Phaser 3 - HTML5 Game Framework
- JavaScript (ES6+)
- Vite - Build tool and development server

## Development

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/BasselAlnabhan/Mathgame.git

# Navigate to the project directory
cd Mathgame

# Install dependencies
npm install

# Start the development server
npm start
```

### Building for Production

```bash
# Create a production build
npm run build
```

## Project Structure

- `src/` - Source code
  - `config/` - Game configuration
  - `managers/` - Manager classes (Sound, UI)
  - `objects/` - Game objects (Monster, MathProblem)
  - `scenes/` - Game scenes (Boot, Menu, Game, GameOver)
  - `index.js` - Main entry point
- `assets/` - Game assets (images, sounds)
- `public/` - Static files

## Code Architecture

The game follows a modular approach with clear separation of concerns:

- **Scene Management**: Different game states are managed by separate scene classes
- **Configuration**: Game settings are centralized in GameConfig
- **UI Factory**: Consistent UI elements created through UIFactory
- **Sound Management**: Audio handled by SoundManager

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Phaser](https://phaser.io/) - The awesome HTML5 game framework
- [OpenGameArt](https://opengameart.org/) - For some of the game assets
