const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let depth = 0;
let oxygen = 100;
let treasures = 0;
let maxDepth = 0;
let speedBoost = 1;
let speedBoostTimer = 0;
let lightRadius = 100;

// Player submarine
const player = {
    x: canvas.width / 2 - 30,
    y: 50,
    width: 60,
    height: 30,
    speed: 3,
    angle: 0
};

// Game objects
let bubbles = [];
let fish = [];
let treasureItems = [];
let obstacles = [];
let powerUps = [];
let seaweed = [];
let particles = [];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Initialize environment
function initBubbles() {
    for (let i = 0; i < 30; i++) {
        bubbles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
}

function initSeaweed() {
    for (let i = 0; i < 10; i++) {
        seaweed.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 20,
            height: Math.random() * 80 + 40,
            sway: Math.random() * 0.02 + 0.01
        });
    }
}

// Create fish
function createFish() {
    if (Math.random() < 0.01) {
        fish.push({
            x: Math.random() < 0.5 ? -40 : canvas.width + 40,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 30,
            height: 15,
            speed: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1)
        });
    }
}

// Create treasure and power-ups
function createTreasure() {
    if (Math.random() < 0.008) {
        treasureItems.push({
            x: Math.random() * (canvas.width - 20),
            y: canvas.height + 20,
            width: 20,
            height: 20,
            speed: 1,
            glow: 0
        });
    }
}

function createPowerUp() {
    if (Math.random() < 0.003) {
        powerUps.push({
            x: Math.random() * (canvas.width - 25),
            y: canvas.height + 25,
            width: 25,
            height: 25,
            speed: 0.8,
            type: Math.random() < 0.5 ? 'speed' : 'light',
            pulse: 0
        });
    }
}

// Create obstacles
function createObstacle() {
    if (Math.random() < 0.008) {
        obstacles.push({
            x: Math.random() * (canvas.width - 40),
            y: canvas.height + 40,
            width: 40,
            height: 60,
            speed: 1.5
        });
    }
}

// Update game
function update() {
    if (!gameRunning) return;

    // Update speed boost
    if (speedBoostTimer > 0) {
        speedBoostTimer--;
        speedBoost = 2;
    } else {
        speedBoost = 1;
    }

    // Move player with rotation
    const currentSpeed = player.speed * speedBoost;
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= currentSpeed;
        player.angle = -0.1;
    } else if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += currentSpeed;
        player.angle = 0.1;
    } else {
        player.angle *= 0.9;
    }
    if (keys['ArrowUp'] && player.y > 0) player.y -= currentSpeed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += currentSpeed;

    // Update depth and oxygen
    depth = Math.floor((canvas.height - player.y) / 8);
    if (depth > maxDepth) maxDepth = depth;
    
    const oxygenLoss = 0.08 + (depth * 0.002);
    oxygen -= oxygenLoss;
    if (oxygen <= 0) {
        gameOver();
        return;
    }
    
    // Update light radius based on depth
    lightRadius = Math.max(60, 120 - depth * 0.5);

    // Update bubbles
    bubbles.forEach(bubble => {
        bubble.y -= bubble.speed;
        if (bubble.y < 0) {
            bubble.y = canvas.height;
            bubble.x = Math.random() * canvas.width;
        }
    });

    // Update fish
    fish = fish.filter(fishItem => {
        fishItem.x += fishItem.speed;
        return fishItem.x > -50 && fishItem.x < canvas.width + 50;
    });

    // Update treasures
    treasureItems = treasureItems.filter(treasure => {
        treasure.y -= treasure.speed;
        treasure.glow += 0.1;
        
        if (player.x < treasure.x + treasure.width &&
            player.x + player.width > treasure.x &&
            player.y < treasure.y + treasure.height &&
            player.y + player.height > treasure.y) {
            treasures++;
            oxygen = Math.min(100, oxygen + 15);
            createParticles(treasure.x, treasure.y, '#FFD700');
            updateUI();
            return false;
        }
        
        return treasure.y > -20;
    });
    
    // Update power-ups
    powerUps = powerUps.filter(powerUp => {
        powerUp.y -= powerUp.speed;
        powerUp.pulse += 0.15;
        
        if (player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y) {
            if (powerUp.type === 'speed') {
                speedBoostTimer = 300;
            } else if (powerUp.type === 'light') {
                lightRadius = Math.min(200, lightRadius + 50);
            }
            createParticles(powerUp.x, powerUp.y, powerUp.type === 'speed' ? '#00FF00' : '#FFFF00');
            return false;
        }
        
        return powerUp.y > -25;
    });

    // Update obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.y -= obstacle.speed;
        
        // Check obstacle collision
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            oxygen -= 20;
            updateUI();
            return false;
        }
        
        return obstacle.y > -60;
    });

    // Update particles
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.size *= 0.98;
        return particle.life > 0;
    });
    
    // Spawn objects
    createFish();
    createTreasure();
    createPowerUp();
    createObstacle();

    updateUI();
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + 10,
            y: y + 10,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            color: color,
            life: 30
        });
    }
}

// Draw everything
function draw() {
    // Clear canvas with depth-based color
    const depthRatio = Math.min(depth / 100, 1);
    const r = Math.floor(135 * (1 - depthRatio));
    const g = Math.floor(206 * (1 - depthRatio * 0.7));
    const b = Math.floor(235 * (1 - depthRatio * 0.3));
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw fish
    ctx.fillStyle = '#FFD700';
    fish.forEach(fishItem => {
        ctx.fillRect(fishItem.x, fishItem.y, fishItem.width, fishItem.height);
        // Fish tail
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(fishItem.speed > 0 ? fishItem.x - 10 : fishItem.x + fishItem.width, 
                    fishItem.y + 5, 10, 5);
        ctx.fillStyle = '#FFD700';
    });

    // Draw treasures
    ctx.fillStyle = '#FF6347';
    treasureItems.forEach(treasure => {
        ctx.fillRect(treasure.x, treasure.y, treasure.width, treasure.height);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(treasure.x + 5, treasure.y + 5, 10, 10);
        ctx.fillStyle = '#FF6347';
    });

    // Draw power-ups
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'speed' ? '#00FF00' : '#FFFF00';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });

    // Draw particles
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    });

    // Draw obstacles (rocks)
    ctx.fillStyle = '#696969';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw player submarine
    ctx.fillStyle = '#32CD32';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Submarine details
    ctx.fillStyle = '#228B22';
    ctx.fillRect(player.x + 10, player.y + 5, 40, 20);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(player.x + 15, player.y + 8, 15, 8);
}

// Update UI
function updateUI() {
    document.getElementById('depth').textContent = depth;
    document.getElementById('oxygen').textContent = Math.max(0, Math.floor(oxygen));
    document.getElementById('treasures').textContent = treasures;
    document.getElementById('speed').textContent = speedBoost > 1 ? 'Boosted!' : 'Normal';
    
    const oxygenBar = document.getElementById('oxygenBar');
    if (oxygenBar) {
        oxygenBar.style.width = Math.max(0, oxygen) + '%';
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalDepth').textContent = maxDepth;
    document.getElementById('finalTreasures').textContent = treasures;
    document.getElementById('gameOver').style.display = 'block';
}

// Restart game
function restartGame() {
    gameRunning = true;
    depth = 0;
    maxDepth = 0;
    oxygen = 100;
    treasures = 0;
    fish = [];
    treasureItems = [];
    obstacles = [];
    player.x = canvas.width / 2 - 30;
    player.y = 50;
    updateUI();
    document.getElementById('gameOver').style.display = 'none';
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game
initBubbles();
initSeaweed();
gameLoop();