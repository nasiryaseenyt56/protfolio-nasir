const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let playersLeft = 10;
let eliminations = 0;
let zoneTimer = 60;
let playerHealth = 100;
let shotsFired = 0;
let shotsHit = 0;
let currentWeapon = 'assault';
let ammo = 30;
let totalAmmo = 90;
let reloading = false;
let reloadTimer = 0;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    speed: 4,
    health: 100,
    armor: 0,
    kills: 0
};

// Weapons
const weapons = {
    assault: { damage: 25, fireRate: 200, ammo: 30, total: 90, reload: 120, name: 'Assault Rifle' },
    sniper: { damage: 75, fireRate: 800, ammo: 5, total: 20, reload: 180, name: 'Sniper Rifle' },
    shotgun: { damage: 60, fireRate: 600, ammo: 8, total: 32, reload: 150, name: 'Shotgun' }
};

// Game objects
let enemies = [];
let bullets = [];
let loot = [];
let explosions = [];
let zone = { x: 0, y: 0, radius: canvas.width };
let targetZone = { x: canvas.width/2, y: canvas.height/2, radius: 200 };
let lastShot = 0;
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');

// Input handling
const keys = {};
const mouse = { x: 0, y: 0, clicked: false };
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') reload();
    if (e.key >= '1' && e.key <= '3') switchWeapon(parseInt(e.key) - 1);
});
document.addEventListener('keyup', (e) => keys[e.key] = false);
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
canvas.addEventListener('click', () => shoot());

// Initialize enemies and loot
function initEnemies() {
    for (let i = 0; i < 9; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 20,
            height: 20,
            health: 100,
            armor: Math.random() * 50,
            speed: 2 + Math.random(),
            lastShot: 0,
            weapon: ['assault', 'sniper', 'shotgun'][Math.floor(Math.random() * 3)],
            ai: {
                target: null,
                moveTimer: 0,
                direction: Math.random() * Math.PI * 2
            }
        });
    }
}

function spawnLoot() {
    if (Math.random() < 0.01) {
        loot.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 30),
            type: Math.random() < 0.3 ? 'weapon' : (Math.random() < 0.5 ? 'health' : 'armor'),
            value: Math.random() < 0.3 ? ['sniper', 'shotgun'][Math.floor(Math.random() * 2)] : 50
        });
    }
}

// Weapon system
function shoot() {
    if (!gameRunning || reloading || ammo <= 0 || Date.now() - lastShot < weapons[currentWeapon].fireRate) return;
    
    const angle = Math.atan2(mouse.y - (player.y + player.height/2), 
                            mouse.x - (player.x + player.width/2));
    
    if (currentWeapon === 'shotgun') {
        for (let i = 0; i < 5; i++) {
            const spread = (Math.random() - 0.5) * 0.3;
            bullets.push({
                x: player.x + player.width/2,
                y: player.y + player.height/2,
                vx: Math.cos(angle + spread) * 10,
                vy: Math.sin(angle + spread) * 10,
                owner: 'player',
                damage: weapons[currentWeapon].damage / 5
            });
        }
    } else {
        bullets.push({
            x: player.x + player.width/2,
            y: player.y + player.height/2,
            vx: Math.cos(angle) * (currentWeapon === 'sniper' ? 15 : 10),
            vy: Math.sin(angle) * (currentWeapon === 'sniper' ? 15 : 10),
            owner: 'player',
            damage: weapons[currentWeapon].damage
        });
    }
    
    ammo--;
    shotsFired++;
    lastShot = Date.now();
}

function reload() {
    if (reloading || ammo === weapons[currentWeapon].ammo || totalAmmo <= 0) return;
    reloading = true;
    reloadTimer = weapons[currentWeapon].reload;
}

function switchWeapon(index) {
    const weaponTypes = ['assault', 'sniper', 'shotgun'];
    if (weaponTypes[index]) {
        currentWeapon = weaponTypes[index];
        ammo = weapons[currentWeapon].ammo;
        totalAmmo = weapons[currentWeapon].total;
    }
}

// Enemy AI
function updateEnemyAI(enemy) {
    enemy.ai.moveTimer--;
    
    // Find nearest target
    let nearestDist = Infinity;
    let nearestTarget = player;
    
    enemies.forEach(other => {
        if (other !== enemy) {
            const dist = Math.hypot(other.x - enemy.x, other.y - enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestTarget = other;
            }
        }
    });
    
    const playerDist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerDist < nearestDist) {
        nearestTarget = player;
        nearestDist = playerDist;
    }
    
    // Move towards target or randomly
    if (nearestDist < 150) {
        const angle = Math.atan2(nearestTarget.y - enemy.y, nearestTarget.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
        
        // Shoot at target
        if (Date.now() - enemy.lastShot > 1000 + Math.random() * 1000) {
            bullets.push({
                x: enemy.x + enemy.width/2,
                y: enemy.y + enemy.height/2,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                owner: 'enemy',
                damage: 20
            });
            enemy.lastShot = Date.now();
        }
    } else if (enemy.ai.moveTimer <= 0) {
        enemy.ai.direction = Math.random() * Math.PI * 2;
        enemy.ai.moveTimer = 60 + Math.random() * 120;
    }
    
    if (enemy.ai.moveTimer > 0) {
        enemy.x += Math.cos(enemy.ai.direction) * enemy.speed * 0.5;
        enemy.y += Math.sin(enemy.ai.direction) * enemy.speed * 0.5;
    }
    
    // Keep in bounds
    enemy.x = Math.max(0, Math.min(canvas.width - enemy.width, enemy.x));
    enemy.y = Math.max(0, Math.min(canvas.height - enemy.height, enemy.y));
}

// Update game
function update() {
    if (!gameRunning) return;
    
    // Handle reloading
    if (reloading) {
        reloadTimer--;
        if (reloadTimer <= 0) {
            const needed = weapons[currentWeapon].ammo - ammo;
            const available = Math.min(needed, totalAmmo);
            ammo += available;
            totalAmmo -= available;
            reloading = false;
        }
    }
    
    // Move player
    const speed = reloading ? player.speed * 0.7 : player.speed;
    if (keys['w'] && player.y > 0) player.y -= speed;
    if (keys['s'] && player.y < canvas.height - player.height) player.y += speed;
    if (keys['a'] && player.x > 0) player.x -= speed;
    if (keys['d'] && player.x < canvas.width - player.width) player.x += speed;
    
    // Check loot collection
    loot = loot.filter(item => {
        const dist = Math.hypot(player.x - item.x, player.y - item.y);
        if (dist < 30) {
            if (item.type === 'health') {
                playerHealth = Math.min(100, playerHealth + item.value);
            } else if (item.type === 'armor') {
                player.armor = Math.min(100, player.armor + item.value);
            } else if (item.type === 'weapon') {
                currentWeapon = item.value;
                ammo = weapons[currentWeapon].ammo;
                totalAmmo = weapons[currentWeapon].total;
            }
            return false;
        }
        return true;
    });
    
    // Update enemies
    enemies.forEach(enemy => updateEnemyAI(enemy));
    
    // Update bullets
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        
        // Check collisions
        if (bullet.owner === 'player') {
            enemies.forEach((enemy, index) => {
                if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                    bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                    let damage = bullet.damage;
                    if (enemy.armor > 0) {
                        const absorbed = Math.min(enemy.armor, damage * 0.5);
                        enemy.armor -= absorbed;
                        damage -= absorbed;
                    }
                    enemy.health -= damage;
                    shotsHit++;
                    
                    explosions.push({ x: bullet.x, y: bullet.y, size: 0, life: 20 });
                    
                    if (enemy.health <= 0) {
                        enemies.splice(index, 1);
                        eliminations++;
                        playersLeft--;
                        player.kills++;
                        
                        // Drop loot
                        if (Math.random() < 0.7) {
                            loot.push({
                                x: enemy.x,
                                y: enemy.y,
                                type: Math.random() < 0.4 ? 'health' : 'armor',
                                value: 25 + Math.random() * 25
                            });
                        }
                    }
                    bullet.x = -100;
                }
            });
        } else {
            if (bullet.x > player.x && bullet.x < player.x + player.width &&
                bullet.y > player.y && bullet.y < player.y + player.height) {
                let damage = bullet.damage;
                if (player.armor > 0) {
                    const absorbed = Math.min(player.armor, damage * 0.6);
                    player.armor -= absorbed;
                    damage -= absorbed;
                }
                playerHealth -= damage;
                explosions.push({ x: bullet.x, y: bullet.y, size: 0, life: 20 });
                bullet.x = -100;
                if (playerHealth <= 0) {
                    gameOver(false);
                    return false;
                }
            }
        }
        
        return bullet.x > 0 && bullet.x < canvas.width && 
               bullet.y > 0 && bullet.y < canvas.height;
    });
    
    // Update zone
    zoneTimer--;
    if (zoneTimer <= 0) {
        zone.radius -= 2;
        if (zone.radius <= targetZone.radius) {
            zoneTimer = 45;
            targetZone.radius = Math.max(50, targetZone.radius - 30);
        }
    }
    
    // Check zone damage
    const playerDist = Math.hypot(player.x + player.width/2 - canvas.width/2, 
                                 player.y + player.height/2 - canvas.height/2);
    if (playerDist > zone.radius) {
        playerHealth -= 2;
        if (playerHealth <= 0) {
            gameOver(false);
            return;
        }
    }
    
    // Zone damage to enemies
    enemies = enemies.filter(enemy => {
        const enemyDist = Math.hypot(enemy.x + enemy.width/2 - canvas.width/2, 
                                   enemy.y + enemy.height/2 - canvas.height/2);
        if (enemyDist > zone.radius) {
            enemy.health -= 3;
            if (enemy.health <= 0) {
                playersLeft--;
                return false;
            }
        }
        return true;
    });
    
    // Update explosions
    explosions = explosions.filter(exp => {
        exp.size += 2;
        exp.life--;
        return exp.life > 0;
    });
    
    // Spawn loot
    spawnLoot();
    
    // Check win condition
    if (playersLeft <= 1) {
        gameOver(true);
    }
    
    updateUI();
    drawMinimap();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw zone
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, zone.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw safe zone
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, targetZone.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw player
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw loot
    loot.forEach(item => {
        ctx.fillStyle = item.type === 'weapon' ? '#9b59b6' : (item.type === 'health' ? '#e74c3c' : '#3498db');
        ctx.fillRect(item.x, item.y, 15, 15);
    });
    
    // Draw enemies
    ctx.fillStyle = '#e74c3c';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Health bar
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(enemy.x, enemy.y - 12, enemy.width, 4);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(enemy.x, enemy.y - 12, (enemy.health/100) * enemy.width, 4);
        
        // Armor bar
        if (enemy.armor > 0) {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(enemy.x, enemy.y - 8, (enemy.armor/100) * enemy.width, 3);
        }
        ctx.fillStyle = '#e74c3c';
    });
    
    // Draw explosions
    explosions.forEach(exp => {
        ctx.fillStyle = `rgba(255, 165, 0, ${exp.life/20})`;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw bullets
    ctx.fillStyle = '#f39c12';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
    });
    
    // Draw player health and armor bars
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x, player.y - 12, player.width, 4);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(player.x, player.y - 12, (playerHealth/100) * player.width, 4);
    
    if (player.armor > 0) {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(player.x, player.y - 8, (player.armor/100) * player.width, 3);
    }
    
    // Draw reload indicator
    if (reloading) {
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(player.x, player.y + player.height + 2, 
                    (1 - reloadTimer/weapons[currentWeapon].reload) * player.width, 3);
    }
}

// Update UI
function updateUI() {
    document.getElementById('playersLeft').textContent = playersLeft;
    document.getElementById('eliminations').textContent = eliminations;
    document.getElementById('zoneTimer').textContent = Math.max(0, Math.ceil(zoneTimer/60));
    document.getElementById('health').textContent = Math.max(0, Math.floor(playerHealth));
    document.getElementById('accuracy').textContent = shotsFired > 0 ? Math.floor((shotsHit/shotsFired) * 100) : 0;
    document.getElementById('weaponName').textContent = weapons[currentWeapon].name;
    document.getElementById('ammo').textContent = ammo;
}

// Draw minimap
function drawMinimap() {
    minimapCtx.fillStyle = '#2c3e50';
    minimapCtx.fillRect(0, 0, 150, 120);
    
    // Draw zone
    const scale = 150 / canvas.width;
    minimapCtx.strokeStyle = '#e74c3c';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.arc(75, 60, zone.radius * scale, 0, Math.PI * 2);
    minimapCtx.stroke();
    
    // Draw players
    minimapCtx.fillStyle = '#3498db';
    minimapCtx.fillRect(player.x * scale - 2, player.y * scale - 2, 4, 4);
    
    minimapCtx.fillStyle = '#e74c3c';
    enemies.forEach(enemy => {
        minimapCtx.fillRect(enemy.x * scale - 1, enemy.y * scale - 1, 2, 2);
    });
    
    // Draw loot
    minimapCtx.fillStyle = '#f39c12';
    loot.forEach(item => {
        minimapCtx.fillRect(item.x * scale, item.y * scale, 1, 1);
    });
}

// Game over
function gameOver(won) {
    gameRunning = false;
    document.getElementById('gameResult').textContent = won ? 'Victory Royale!' : 'Eliminated!';
    document.getElementById('finalEliminations').textContent = eliminations;
    document.getElementById('placement').textContent = '#' + playersLeft;
    document.getElementById('gameOver').style.display = 'block';
}

// Restart game
function restartGame() {
    gameRunning = true;
    playersLeft = 10;
    eliminations = 0;
    zoneTimer = 60;
    playerHealth = 100;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = 100;
    enemies = [];
    bullets = [];
    zone = { x: 0, y: 0, radius: canvas.width };
    targetZone = { x: canvas.width/2, y: canvas.height/2, radius: 200 };
    initEnemies();
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
initEnemies();
gameLoop();