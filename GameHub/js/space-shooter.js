const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let lives = 3;
let level = 1;
let enemySpawnRate = 0.02;
let lastShotTime = 0;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 5,
    fireRate: 200,
    bulletSpeed: 7,
    bulletDamage: 1
};

// Arrays for game objects
let bullets = [];
let enemies = [];
let stars = [];
let powerUps = [];
let explosions = [];
let particles = [];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Initialize stars for background
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1
        });
    }
}

// Create enemy with different types
function createEnemy() {
    const enemyType = Math.random();
    let enemy;
    
    if (enemyType < 0.7) {
        // Basic enemy
        enemy = {
            x: Math.random() * (canvas.width - 40),
            y: -40,
            width: 40,
            height: 30,
            speed: 2 + Math.random() * 2,
            health: 1,
            color: '#ff0000',
            points: 10,
            type: 'basic'
        };
    } else if (enemyType < 0.9) {
        // Fast enemy
        enemy = {
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 25,
            speed: 4 + Math.random() * 2,
            health: 1,
            color: '#ff8800',
            points: 20,
            type: 'fast'
        };
    } else {
        // Tank enemy
        enemy = {
            x: Math.random() * (canvas.width - 60),
            y: -60,
            width: 60,
            height: 45,
            speed: 1 + Math.random(),
            health: 3,
            color: '#8800ff',
            points: 50,
            type: 'tank'
        };
    }
    
    enemies.push(enemy);
}

// Create bullet
function createBullet() {
    const now = Date.now();
    if (now - lastShotTime < player.fireRate) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: player.bulletSpeed,
        damage: player.bulletDamage
    });
    lastShotTime = now;
}

// Create power-up
function createPowerUp() {
    const types = ['rapidFire', 'multiShot', 'shield', 'extraLife'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        type: type,
        color: type === 'rapidFire' ? '#00ff00' : 
               type === 'multiShot' ? '#0088ff' :
               type === 'shield' ? '#ffff00' : '#ff00ff'
    });
}

// Create explosion
function createExplosion(x, y, size = 20) {
    explosions.push({
        x: x,
        y: y,
        size: size,
        maxSize: size * 2,
        life: 20,
        maxLife: 20
    });
    
    // Create particles
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            maxLife: 30,
            color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`
        });
    }
}

// Update game objects
function update() {
    if (!gameRunning) return;

    // Move player
    if ((keys['ArrowLeft'] || keys['a'] || keys['A']) && player.x > 0) player.x -= player.speed;
    if ((keys['ArrowRight'] || keys['d'] || keys['D']) && player.x < canvas.width - player.width) player.x += player.speed;
    if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.y > 0) player.y -= player.speed;
    if ((keys['ArrowDown'] || keys['s'] || keys['S']) && player.y < canvas.height - player.height) player.y += player.speed;
    if (keys[' '] || keys['Enter']) {
        createBullet();
    }

    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });

    // Update enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        return enemy.y < canvas.height;
    });
    
    // Update power-ups
    powerUps = powerUps.filter(powerUp => {
        powerUp.y += powerUp.speed;
        return powerUp.y < canvas.height;
    });
    
    // Update explosions
    explosions = explosions.filter(explosion => {
        explosion.life--;
        explosion.size = explosion.maxSize * (explosion.life / explosion.maxLife);
        return explosion.life > 0;
    });
    
    // Update particles
    particles = particles.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        return particle.life > 0;
    });

    // Check bullet-enemy collisions
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);
                enemy.health -= bullet.damage;
                
                if (enemy.health <= 0) {
                    createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    enemies.splice(enemyIndex, 1);
                    score += enemy.points;
                    
                    // Chance to drop power-up
                    if (Math.random() < 0.1) {
                        createPowerUp();
                    }
                }
                updateScore();
            }
        });
    });
    
    // Check player-powerup collisions
    powerUps.forEach((powerUp, index) => {
        if (player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y) {
            powerUps.splice(index, 1);
            applyPowerUp(powerUp.type);
        }
    });

    // Check player-enemy collisions
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            enemies.splice(index, 1);
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
            }
        }
    });

    // Spawn enemies (rate increases with level)
    if (Math.random() < enemySpawnRate) {
        createEnemy();
    }
    
    // Level progression
    if (score > level * 200) {
        level++;
        enemySpawnRate = Math.min(0.05, 0.02 + level * 0.005);
        document.getElementById('level').textContent = level;
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, 1, 1);
    });

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player details
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 20, player.y - 5, 10, 5);

    // Draw bullets
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw health bar for tank enemies
        if (enemy.type === 'tank' && enemy.health < 3) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(enemy.x, enemy.y - 8, (enemy.width * enemy.health) / 3, 4);
        }
    });
    
    // Draw power-ups
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        // Add glow effect
        ctx.shadowColor = powerUp.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(powerUp.x + 5, powerUp.y + 5, powerUp.width - 10, powerUp.height - 10);
        ctx.shadowBlur = 0;
    });
    
    // Draw explosions
    explosions.forEach(explosion => {
        const alpha = explosion.life / explosion.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `hsl(${30 + Math.random() * 30}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    // Draw particles
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
        ctx.globalAlpha = 1;
    });
}

// Apply power-up effects
function applyPowerUp(type) {
    switch(type) {
        case 'rapidFire':
            player.fireRate = Math.max(50, player.fireRate - 50);
            setTimeout(() => player.fireRate = 200, 5000);
            break;
        case 'multiShot':
            const originalCreateBullet = createBullet;
            createBullet = function() {
                const now = Date.now();
                if (now - lastShotTime < player.fireRate) return;
                
                for (let i = -1; i <= 1; i++) {
                    bullets.push({
                        x: player.x + player.width / 2 - 2 + i * 15,
                        y: player.y,
                        width: 4,
                        height: 10,
                        speed: player.bulletSpeed,
                        damage: player.bulletDamage
                    });
                }
                lastShotTime = now;
            };
            setTimeout(() => createBullet = originalCreateBullet, 3000);
            break;
        case 'shield':
            player.speed += 2;
            setTimeout(() => player.speed -= 2, 4000);
            break;
        case 'extraLife':
            lives++;
            updateLives();
            break;
    }
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Restart game
function restartGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    level = 1;
    enemySpawnRate = 0.02;
    bullets = [];
    enemies = [];
    powerUps = [];
    explosions = [];
    particles = [];
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    player.fireRate = 200;
    player.speed = 5;
    updateScore();
    updateLives();
    document.getElementById('level').textContent = level;
    document.getElementById('gameOver').style.display = 'none';
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game
initStars();
gameLoop();