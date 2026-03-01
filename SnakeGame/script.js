document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const welcomeScreen = document.getElementById('welcomeScreen');
    const gameScreen = document.getElementById('gameScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const startGameBtn = document.getElementById('startGameBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const exitGameBtn = document.getElementById('exitGameBtn');
    const nicknameInput = document.getElementById('nickname');
    const playerNameDisplay = document.getElementById('playerNameDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const finalScore = document.getElementById('finalScore');
    const finalHighScore = document.getElementById('finalHighScore');
    const newHighScoreMessage = document.getElementById('newHighScoreMessage');
    
    // Game variables
    let canvas, ctx;
    let snake, food;
    let gridSize = 20;
    let tileCount = 20;
    let speed = 7;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameLoop;
    let direction = { x: 0, y: 0 };
    let lastDirection = { x: 0, y: 0 };
    let difficulty = 'easy';
    let playerName = 'Player';
    let gameStarted = false;
    
    // Initialize the game
    function initGame() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = tileCount * gridSize;
        canvas.height = tileCount * gridSize;
        
        // Initialize snake
        snake = [
            { x: 10, y: 10 }
        ];
        
        // Place first food
        placeFood();
        
        // Reset score and direction
        score = 0;
        direction = { x: 0, y: 0 };
        lastDirection = { x: 0, y: 0 };
        
        // Update displays
        updateScoreDisplay();
        highScoreDisplay.textContent = highScore;
    }
    
    // Start the game
    function startGame() {
        playerName = nicknameInput.value.trim() || 'Player';
        playerNameDisplay.textContent = playerName;
        
        welcomeScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        gameOverScreen.style.display = 'none';
        
        initGame();
        gameStarted = true;
        
        // Set game speed based on difficulty
        switch(difficulty) {
            case 'easy':
                speed = 7;
                break;
            case 'medium':
                speed = 10;
                break;
            case 'hard':
                speed = 15;
                break;
        }
        
        // Start game loop
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(gameUpdate, 1000 / speed);
    }
    
    // Game update loop
    function gameUpdate() {
        // Clear canvas
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        drawSnake();
        
        // Draw food
        drawFood();
        
        // Move snake
        moveSnake();
        
        // Check collision
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if snake ate food
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // Grow snake
            snake.push({ ...snake[snake.length - 1] });
            
            // Increase score
            score += 10 * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3);
            updateScoreDisplay();
            
            // Place new food
            placeFood();
        }
    }
    
    // Draw snake
    function drawSnake() {
        snake.forEach((segment, index) => {
            // Head is different color
            if (index === 0) {
                ctx.fillStyle = '#4CAF50';
            } else {
                // Gradient body
                const intensity = 150 + Math.floor(105 * (index / snake.length));
                ctx.fillStyle = `rgb(76, ${intensity}, 80)`;
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            
            // Add eyes to head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Eye positions based on direction
                if (direction.x === 1 || (direction.x === 0 && direction.y === 0)) {
                    // Right or initial position
                    ctx.fillRect((segment.x * gridSize) + 10, (segment.y * gridSize) + 3, 4, 4);
                    ctx.fillRect((segment.x * gridSize) + 10, (segment.y * gridSize) + 13, 4, 4);
                } else if (direction.x === -1) {
                    // Left
                    ctx.fillRect((segment.x * gridSize) + 5, (segment.y * gridSize) + 3, 4, 4);
                    ctx.fillRect((segment.x * gridSize) + 5, (segment.y * gridSize) + 13, 4, 4);
                } else if (direction.y === -1) {
                    // Up
                    ctx.fillRect((segment.x * gridSize) + 3, (segment.y * gridSize) + 5, 4, 4);
                    ctx.fillRect((segment.x * gridSize) + 13, (segment.y * gridSize) + 5, 4, 4);
                } else if (direction.y === 1) {
                    // Down
                    ctx.fillRect((segment.x * gridSize) + 3, (segment.y * gridSize) + 10, 4, 4);
                    ctx.fillRect((segment.x * gridSize) + 13, (segment.y * gridSize) + 10, 4, 4);
                }
            }
        });
    }
    
    // Draw food
    function drawFood() {
        ctx.fillStyle = '#F44336';
        ctx.beginPath();
        const centerX = (food.x * gridSize) + (gridSize / 2);
        const centerY = (food.y * gridSize) + (gridSize / 2);
        ctx.arc(centerX, centerY, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some details to make food look like an apple
        ctx.fillStyle = '#8BC34A';
        ctx.beginPath();
        ctx.moveTo(centerX - 3, centerY - 8);
        ctx.lineTo(centerX, centerY - 12);
        ctx.lineTo(centerX + 3, centerY - 8);
        ctx.fill();
    }
    
    // Place food at random position
    function placeFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return placeFood();
            }
        }
    }
    
    // Move snake
    function moveSnake() {
        lastDirection = { ...direction };
        
        // Create new head
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        
        // Add new head to beginning of array
        snake.unshift(head);
        
        // Remove tail
        snake.pop();
    }
    
    // Check collision
    function checkCollision() {
        const head = snake[0];
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return true;
        }
        
        // Self collision (skip head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameLoop);
        gameStarted = false;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            newHighScoreMessage.style.display = 'block';
        } else {
            newHighScoreMessage.style.display = 'none';
        }
        
        // Update game over screen
        finalScore.textContent = score;
        finalHighScore.textContent = highScore;
        
        // Show game over screen
        gameScreen.style.display = 'none';
        gameOverScreen.style.display = 'block';
    }
    
    // Update score display
    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
    }
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    
    playAgainBtn.addEventListener('click', () => {
        startGame();
    });
    
    exitGameBtn.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        welcomeScreen.style.display = 'block';
    });
    
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            difficulty = btn.dataset.level;
            levelDisplay.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            
            // Update active button style
            document.querySelectorAll('.difficulty-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });
    
    // Keyboard controls
    document.addEventListener('keydown', e => {
        if (!gameStarted) return;
        
        // Prevent reversing direction
        switch(e.key) {
            case 'ArrowUp':
                if (lastDirection.y === 0) {
                    direction = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
                if (lastDirection.y === 0) {
                    direction = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
                if (lastDirection.x === 0) {
                    direction = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
                if (lastDirection.x === 0) {
                    direction = { x: 1, y: 0 };
                }
                break;
        }
    });
    
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', e => {
        if (!gameStarted) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', e => {
        if (!gameStarted) return;
        e.preventDefault();
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Determine swipe direction
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0 && lastDirection.x === 0) {
                direction = { x: 1, y: 0 }; // Right
            } else if (dx < 0 && lastDirection.x === 0) {
                direction = { x: -1, y: 0 }; // Left
            }
        } else {
            // Vertical swipe
            if (dy > 0 && lastDirection.y === 0) {
                direction = { x: 0, y: 1 }; // Down
            } else if (dy < 0 && lastDirection.y === 0) {
                direction = { x: 0, y: -1 }; // Up
            }
        }
    }, false);
    
    // Set default difficulty to easy
    document.querySelector('.difficulty-btn[data-level="easy"]').classList.add('active');
});