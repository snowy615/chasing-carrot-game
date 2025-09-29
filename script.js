// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Game state
let score = 0;
let gameSpeed = 5;
let gameRunning = false;

// Rabbit properties
const rabbit = {
    x: 50,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    jumping: false,
    jumpVelocity: 0,
    gravity: 0.8,
    jumpPower: 15
};

// Carrot properties (the item being chased)
const carrot = {
    x: canvas.width - 100,
    y: canvas.height - 50,
    width: 30,
    height: 30
};

// Obstacles array
let obstacles = [];
let consecutiveObstacles = 0; // Track consecutive obstacles
let lastObstacleX = 0; // Track position of last obstacle

// Ground level
const ground = canvas.height - 10;

// Initialize game
function init() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    consecutiveObstacles = 0;
    lastObstacleX = 0;
    rabbit.y = canvas.height - 50;
    rabbit.jumping = false;
    rabbit.jumpVelocity = 0;
    gameOverElement.style.display = 'none';
    gameRunning = true;
    scoreElement.textContent = score;
    animate();
}

// Draw rabbit character
function drawRabbit() {
    ctx.fillStyle = '#cccccc'; // Gray rabbit
    ctx.fillRect(rabbit.x, rabbit.y, rabbit.width, rabbit.height);
    
    // Draw rabbit ears
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rabbit.x + 5, rabbit.y - 15, 8, 15);
    ctx.fillRect(rabbit.x + rabbit.width - 13, rabbit.y - 15, 8, 15);
    
    // Draw rabbit eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(rabbit.x + rabbit.width - 10, rabbit.y + 10, 4, 4);
}

// Draw carrot character
function drawCarrot() {
    ctx.fillStyle = '#FF8C00'; // Orange carrot
    ctx.beginPath();
    ctx.moveTo(carrot.x, carrot.y);
    ctx.lineTo(carrot.x + carrot.width, carrot.y);
    ctx.lineTo(carrot.x + carrot.width/2, carrot.y - carrot.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw carrot greens
    ctx.fillStyle = '#228B22';
    ctx.fillRect(carrot.x + carrot.width/2 - 5, carrot.y - carrot.height - 5, 10, 5);
}

// Draw ground
function drawGround() {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, ground, canvas.width, canvas.height - ground);
    
    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, ground, canvas.width, 5);
}

// Create new obstacle
function createObstacle() {
    // Limit consecutive obstacles to ensure gaps for jumping
    if (consecutiveObstacles >= 3) {
        // Force a gap by skipping obstacle creation
        consecutiveObstacles = 0;
        return;
    }
    
    // Ensure minimum gap between obstacles
    const minGap = 30;
    const currentX = canvas.width;
    
    // If this isn't the first obstacle, ensure there's a gap
    if (lastObstacleX > 0) {
        const distanceFromLast = currentX - lastObstacleX;
        if (distanceFromLast < minGap) {
            // Not enough space, skip creating obstacle
            return;
        }
    }
    
    const height = Math.random() * 30 + 20;
    const obstacle = {
        x: currentX,
        y: ground - height,
        width: 20,
        height: height,
        passed: false
    };
    obstacles.push(obstacle);
    consecutiveObstacles++;
    lastObstacleX = currentX;
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw cactus details
        ctx.fillStyle = '#228B22';
        ctx.fillRect(obstacle.x + 5, obstacle.y - 10, 3, 10);
        ctx.fillRect(obstacle.x + 12, obstacle.y - 15, 3, 15);
    });
}

// Update obstacles
function updateObstacles() {
    // Move obstacles
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });
    
    // Remove obstacles that are off screen
    const initialLength = obstacles.length;
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    
    // Reset consecutive counter when obstacles are removed (gap created)
    if (obstacles.length < initialLength) {
        consecutiveObstacles = 0;
    }
    
    // Update lastObstacleX to track the rightmost obstacle
    if (obstacles.length > 0) {
        lastObstacleX = Math.max(...obstacles.map(obs => obs.x));
    } else {
        lastObstacleX = 0;
    }
    
    // Create new obstacles with controlled frequency
    // Only create new obstacles occasionally to ensure gaps
    if (Math.random() < 0.02 && consecutiveObstacles < 3) {
        createObstacle();
    } else if (Math.random() < 0.01) {
        // Occasionally force a gap to reset the pattern
        consecutiveObstacles = 0;
    }
    
    // Update score when passing obstacles
    obstacles.forEach(obstacle => {
        if (!obstacle.passed && obstacle.x + obstacle.width < rabbit.x) {
            obstacle.passed = true;
            score++;
            scoreElement.textContent = score;
        }
    });
}

// Update rabbit position
function updateRabbit() {
    if (rabbit.jumping) {
        rabbit.y -= rabbit.jumpVelocity;
        rabbit.jumpVelocity -= rabbit.gravity;
        
        // Check if rabbit has landed
        if (rabbit.y >= canvas.height - 50) {
            rabbit.y = canvas.height - 50;
            rabbit.jumping = false;
        }
    }
}

// Check for collisions
function checkCollision() {
    // Ground collision
    if (rabbit.y >= canvas.height - 50) {
        rabbit.y = canvas.height - 50;
        rabbit.jumping = false;
    }
    
    // Obstacle collisions
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        
        if (
            rabbit.x < obstacle.x + obstacle.width &&
            rabbit.x + rabbit.width > obstacle.x &&
            rabbit.y < obstacle.y + obstacle.height &&
            rabbit.y + rabbit.height > obstacle.y
        ) {
            // Collision detected
            gameOver();
            return;
        }
    }
}

// Game over function
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Jump function
function jump() {
    if (!rabbit.jumping && gameRunning) {
        rabbit.jumping = true;
        rabbit.jumpVelocity = rabbit.jumpPower;
    }
}

// Animation loop
function animate() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawGround();
    drawRabbit();
    drawCarrot();
    drawObstacles();
    
    // Update game elements
    updateRabbit();
    updateObstacles();
    checkCollision();
    
    // Increase game speed over time
    if (score > 0 && score % 10 === 0) {
        gameSpeed = 5 + Math.floor(score / 10);
    }
    
    requestAnimationFrame(animate);
}

// Event listeners
document.addEventListener('keydown', function(e) {
    if ((e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') && gameRunning) {
        jump();
    }
});

// Touch support for mobile devices
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (gameRunning) {
        jump();
    }
});

// Restart button
restartBtn.addEventListener('click', init);

// Start the game
init();