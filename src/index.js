import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    scene: [BootScene, MenuScene, GameScene, GameOverScene],
    audio: {
        disableWebAudio: false,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
        parent: 'game',
        expandParent: true
    }
};

// Create a container for the game if it doesn't exist
window.addEventListener('load', () => {
    let gameContainer = document.getElementById('game');
    if (!gameContainer) {
        gameContainer = document.createElement('div');
        gameContainer.id = 'game';
        document.body.appendChild(gameContainer);

        // Set the container to fill the viewport
        gameContainer.style.width = '100vw';
        gameContainer.style.height = '100vh';
        gameContainer.style.margin = '0';
        gameContainer.style.padding = '0';
        gameContainer.style.overflow = 'hidden';
    }

    const game = new Phaser.Game(config);

    // Handle resize events for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            game.scale.refresh();
        }, 200);
    });
}); 