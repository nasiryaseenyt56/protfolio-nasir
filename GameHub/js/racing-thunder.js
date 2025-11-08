// Racing Thunder Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    speed: 0,
    position: 1,
    lap: 1,
    time: 0,
    prize: 0,
    gameRunning: true
};

// Car object
const car = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 80,
    speed: 0,
    maxSpeed: 8,
    acceleration: 0.2,
    friction: 0.1
};

// Track elements
const trackWidth = 300;
const trackCenterX = canvas.width / 2;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// Game loop
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Handle input
    if (keys['w'] || keys['arrowup']) {
        car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
    }
    if (keys['s'] || keys['arrowdown']) {
        car.speed = Math.max(car.speed - car.acceleration * 2, -car.maxSpeed / 2);
    }
    if (keys['a'] || keys['arrowleft']) {
        car.x -= 3;
    }
    if (keys['d'] || keys['arrowright']) {
        car.x += 3;
    }
    
    // Apply friction
    car.speed *= (1 - car.friction);
    
    // Keep car on track
    car.x = Math.max(trackCenterX - trackWidth/2 + 20, Math.min(car.x, trackCenterX + trackWidth/2 - 20));
    
    // Update game state
    gameState.speed = Math.floor(Math.abs(car.speed) * 15);
    gameState.time += 1/60;
    
    // Update UI
    document.getElementById('speedValue').textContent = gameState.speed;
    document.getElementById('time').textContent = formatTime(gameState.time);
    document.getElementById('lap').textContent = `${gameState.lap}/3`;
    document.getElementById('position').textContent = '1st';
    document.getElementById('prize').textContent = `$${gameState.prize}`;
    
    // Simple lap completion
    if (gameState.time > 30 && gameState.lap < 3) {
        gameState.lap++;
        gameState.prize += 500;
        gameState.time = 0;
    } else if (gameState.time > 30 && gameState.lap >= 3) {
        endRace();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw track
    ctx.fillStyle = '#696969';
    ctx.fillRect(trackCenterX - trackWidth/2, 0, trackWidth, canvas.height);
    
    // Draw track lines
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(trackCenterX, 0);
    ctx.lineTo(trackCenterX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw track borders
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackCenterX - trackWidth/2, 0);
    ctx.lineTo(trackCenterX - trackWidth/2, canvas.height);
    ctx.moveTo(trackCenterX + trackWidth/2, 0);
    ctx.lineTo(trackCenterX + trackWidth/2, canvas.height);
    ctx.stroke();
    
    // Draw car
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(car.x - car.width/2, car.y - car.height/2, car.width, car.height);
    
    // Car details
    ctx.fillStyle = '#000000';
    ctx.fillRect(car.x - 15, car.y - 30, 30, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(car.x - 12, car.y - 27, 24, 14);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function endRace() {
    gameState.gameRunning = false;
    document.getElementById('finalTime').textContent = formatTime(gameState.time);
    document.getElementById('finalPosition').textContent = '1st';
    document.getElementById('finalPrize').textContent = `$${gameState.prize}`;
    document.getElementById('gameOver').style.display = 'block';
}

function restartRace() {
    gameState = {
        speed: 0,
        position: 1,
        lap: 1,
        time: 0,
        prize: 0,
        gameRunning: true
    };
    car.x = canvas.width / 2;
    car.speed = 0;
    document.getElementById('gameOver').style.display = 'none';
    gameLoop();
}

// Start game
gameLoop();