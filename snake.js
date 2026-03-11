// Get the canvas element and its 2D drawing context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Get the score and level display elements
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Define the size of each grid cell and calculate the number of tiles
const gridSize = 20;
const tileCountX = canvas.width / gridSize;
const tileCountY = canvas.height / gridSize;


// Game level variables
let currentLevel = 1;
const foodPerLevel = 5;
let speed = 150; // milliseconds between moves
let intervalId;
let gameStarted = false;
let waitingForNextLevel = false; // pause while showing level message

// Initialize the snake as an array of segments, starting with one segment at position (10,10)
let snake = [{x: 10, y: 10}];

// Initialize the food position randomly
let food = {x: 15, y: 15};

// Initialize random obstacles based on level
let obstacles = [];
let numObstacles = currentLevel * 2;

// Direction variables for snake movement (dx for x-axis, dy for y-axis)
let dx = 0;
let dy = 0;

// Player score
let score = 0;

// Initialize displays
scoreDisplay.textContent = 'Score: ' + score;
levelDisplay.textContent = 'Level: ' + currentLevel;

// Function to play a simple beep sound
function playBeep(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Function to play game over sound
function playGameOverSound() {
    playBeep(200, 0.5, 'sawtooth'); // Low, harsh sound
}

// Function to play level up sound
function playLevelUpSound() {
    playBeep(800, 0.3); // High, pleasant sound
}

// Function to regenerate obstacles
function regenerateObstacles() {
    obstacles = [];
    for (let i = 0; i < numObstacles; i++) {
        let obs;
        do {
            obs = {x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY)};
        } while (
            snake.some(segment => segment.x === obs.x && segment.y === obs.y) ||
            (food.x === obs.x && food.y === obs.y) ||
            obstacles.some(o => o.x === obs.x && o.y === obs.y)
        );
        obstacles.push(obs);
    }
}

// Initialize obstacles
regenerateObstacles();

// Function to draw the game elements on the canvas
function drawGame() {
    // Clear the canvas with black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the obstacles in gray color
    ctx.fillStyle = 'gray';
    for (let obs of obstacles) {
        ctx.fillRect(obs.x * gridSize, obs.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // Draw the snake segments in lime color; head is special
    ctx.fillStyle = 'lime';
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        if (i === 0) {
            // head: circle with eyes pointing direction
            const cx = x + gridSize/2;
            const cy = y + gridSize/2;
            const r = gridSize/2 - 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI*2);
            ctx.fill();
            // eyes
            ctx.fillStyle = 'black';
            const eyeOffset = r/2;
            let ex = cx, ey = cy;
            if (dx === 1) { ex += eyeOffset; ey -= eyeOffset; }
            else if (dx === -1) { ex -= eyeOffset; ey -= eyeOffset; }
            else if (dy === 1) { ex += eyeOffset; ey += eyeOffset; }
            else if (dy === -1) { ex -= eyeOffset; ey -= eyeOffset; }
            ctx.beginPath();
            ctx.arc(ex, ey, 2, 0, Math.PI*2);
            ctx.arc(ex + (dx!==0?0:4), ey + (dy!==0?0:4), 2, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'lime';
        } else {
            ctx.fillRect(x, y, gridSize - 2, gridSize - 2);
        }
    }

    // Draw the food in red color
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Function to update the snake's position and handle food consumption
function moveSnake() {
    // Calculate the new head position based on current direction
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Wrap around the edges
    head.x = (head.x + tileCountX) % tileCountX;
    head.y = (head.y + tileCountY) % tileCountY;

    // Add the new head to the front of the snake array
    snake.unshift(head);

    // Check if the snake has eaten the food
    if (head.x === food.x && head.y === food.y) {
        // Increase score and generate new food position
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        do {
            food = {x: Math.floor(Math.random() * tileCountX), y: Math.floor(Math.random() * tileCountY)};
        } while (
            snake.some(segment => segment.x === food.x && segment.y === food.y) ||
            obstacles.some(obs => obs.x === food.x && obs.y === food.y)
        );

        // Check for level up
        if (score % foodPerLevel === 0) {
            showLevelComplete();
        }
    } else {
        // Remove the tail segment if no food was eaten
        snake.pop();
    }
}

// Function to check for collisions with obstacles or self
function checkCollision() {
    const head = snake[0];
    // Check obstacle collision
    for (let obs of obstacles) {
        if (head.x === obs.x && head.y === obs.y) {
            return true;
        }
    }
    // Check self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// advance to the next level after overlay confirm
function advanceLevel() {
    playLevelUpSound();
    waitingForNextLevel = false;
    document.getElementById('messageOverlay').style.display = 'none';
    if (currentLevel < 5) {
        currentLevel++;
        speed = Math.max(50, speed - 20);
        clearInterval(intervalId);
        intervalId = setInterval(gameLoop, speed);
        numObstacles = currentLevel * 2;
        regenerateObstacles();
        levelDisplay.textContent = 'Level: ' + currentLevel;
        gameStarted = true;
    } else {
        // max level reached message
        document.getElementById('messageText').textContent = 'Congratulations! You have achieved the maximum level. You are now in the league of legends!';
        document.getElementById('continueBtn').textContent = 'Restart';
        document.getElementById('messageOverlay').style.display = 'flex';
    }
}

// show overlay when level completes
function showLevelComplete() {
    waitingForNextLevel = true;
    gameStarted = false;
    document.getElementById('messageText').textContent = `Congratulations on completing Level ${currentLevel}.`;
    document.getElementById('continueBtn').textContent = (currentLevel < 5 ? `Go to Level ${currentLevel+1}` : 'Finish');
    document.getElementById('messageOverlay').style.display = 'flex';
}

// Main game loop function
function gameLoop() {
    if (gameStarted) {
        // Move the snake
        moveSnake();
        // Check for game over conditions
        if (checkCollision()) {
            playGameOverSound();
            alert('Game Over! Score: ' + score);
            // Reload the page to restart the game
            document.location.reload();
        }
    }
    // Redraw the game
    drawGame();
}

// Event listener for keyboard input to change snake direction
document.addEventListener('keydown', (e) => {
    // Prevent reversing direction directly (e.g., can't go left if currently going right)
    if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
    if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
    if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
    if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
});

// Event listeners for touch controls
document.getElementById('up').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (dy === 0) { dx = 0; dy = -1; }
});
document.getElementById('up').addEventListener('click', (e) => {
    if (dy === 0) { dx = 0; dy = -1; }
});
document.getElementById('down').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (dy === 0) { dx = 0; dy = 1; }
});
document.getElementById('down').addEventListener('click', (e) => {
    if (dy === 0) { dx = 0; dy = 1; }
});
document.getElementById('left').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (dx === 0) { dx = -1; dy = 0; }
});
document.getElementById('left').addEventListener('click', (e) => {
    if (dx === 0) { dx = -1; dy = 0; }
});
document.getElementById('right').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (dx === 0) { dx = 1; dy = 0; }
});
document.getElementById('right').addEventListener('click', (e) => {
    if (dx === 0) { dx = 1; dy = 0; }
});

// Start the game loop
intervalId = setInterval(gameLoop, speed);

// Event listener for start button
document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    dx = 1;
    dy = 0;
    document.getElementById('startBtn').style.display = 'none';
});

// continue button for level progression or restart
const continueBtn = document.getElementById('continueBtn');
continueBtn.addEventListener('click', () => {
    if (currentLevel < 5 || (currentLevel === 5 && waitingForNextLevel)) {
        advanceLevel();
    } else {
        // restart after max
        document.location.reload();
    }
});