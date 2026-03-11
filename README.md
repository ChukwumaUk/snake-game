# Snake Game

A classic Snake game implemented in JavaScript with levels and obstacles.

## Usage

Open `index.html` in a web browser to play the game.

Use arrow keys to control the snake:

- Left arrow: Move left
- Up arrow: Move up
- Right arrow: Move right
- Down arrow: Move down

The snake wraps around the edges. The game ends if the snake hits an obstacle (gray) or its own body. Score increases by eating red food squares.

## Levels

- Levels 1 to 5 with increasing difficulty.
- Level 1: Slow speed, 2 obstacles.
- Each level increases speed and adds 2 more obstacles.
- Advance to the next level after eating 5 food items.
- Upon reaching level 5, you become the "undisputed champion" and can restart.

## Sounds

- Level up: Pleasant high beep.
- Game over: Harsh low beep.

## Files

- `index.html`: The HTML file to run the game.
- `snake.js`: The JavaScript code for the game logic.
- `README.md`: This file.

## Troubleshooting

- Ensure your browser supports HTML5 Canvas.
- If the game doesn't load, check the console for errors.
