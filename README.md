# Math Monster Game

A math learning game built with Phaser 3 where monsters descend from the top of the screen with math problems. Solve the problems to defeat the monsters before they reach the bottom of the screen!

## Features

- Multiple difficulty levels (Easy, Medium, Hard)
- Progressive difficulty that increases over time
- Different types of math problems (Addition, Subtraction, Multiplication)
- Various monster types with unique animations
- Sound effects and background music
- Score tracking

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd math-monster-game
```

2. Install dependencies:

```bash
npm install
```

## Running the Game

Start the development server:

```bash
npm start
```

The game will be available at `http://localhost:3000`.

## Building for Production

Build the game for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- Phaser 3 - HTML5 game framework
- Vite - Next-generation frontend build tool
- JavaScript (ES6+)

## Project Structure

- `src/index.js` - Main entry point
- `src/scenes/` - Game scenes (Boot, Menu, Game, GameOver)
- `src/objects/` - Game objects (Monster, MathProblem)
- `src/assets/` - Game assets (images, sounds, fonts)

## Game Controls

- **Number Keys (0-9)**: Enter answers
- **Backspace**: Delete entered digit
- **Enter**: Submit answer

## Credits

- Original game developed as a canvas-based HTML5 game
- Modernized with Phaser 3 for improved performance and structure
