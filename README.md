# Snake Game

A classic Snake game implemented in JavaScript with levels and obstacles.

## Usage

Open `index.html` in a web browser (desktop or mobile) to play the game.

Use arrow keys (desktop) or on-screen touch buttons (mobile) to move the snake:

- Left arrow / ← button: Move left
- Up arrow / ↑ button: Move up
- Right arrow / → button: Move right
- Down arrow / ↓ button: Move down

The snake wraps around the edges. The game ends if the snake hits an obstacle (gray) or its own body. Score increases by eating red food squares.

When you complete a level a message appears with a button to proceed. After level 5 you receive a champion message and can restart.

## Levels

- Levels 1 to 5 with increasing difficulty.
- Level 1: Slow speed, 2 obstacles.
- Each level increases speed and adds 2 more obstacles.
- Advance to the next level after eating 5 food items.
- Upon reaching level 5, you become the "undisputed champion" and can restart.

## Mobile Support

The game is fully responsive and works on mobile devices with touch controls. Tap the on-screen arrow buttons to control the snake.

## Files

- `index.html`: The HTML file to run the game.
- `snake.js`: The JavaScript code for the game logic.
- `README.md`: This file.

## Troubleshooting

- Ensure your browser supports HTML5 Canvas.
- If the game doesn't load, check the console for errors.
