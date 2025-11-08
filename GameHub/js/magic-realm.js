// Magic Realm - Mystical World of Wizards
class MagicRealm {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = true;
        this.keys = {};
        
        // Player wizard
        this.wizard = {
            x: 400,
            y: 300,
            width: 40,
            height: 40,
            speed: 4,
            mana: 100,
            maxMana: 100,
            health: 100,
            shield: false
        };
        
        // Game state
        this.level = 1;
        this.score = 0;
        this.crystals = 0;
        this.enemies = [];
        this.spells = [];
        this.particles = [];
        this.crystalItems = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.spawnEnemies();
        this.spawnCrystals();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Spell casting
            if (e.key.toLowerCase() === 'f') this.castSpell('fireball');
            if (e.key.toLowerCase() === 'l') this.castSpell('lightning');
            if (e.key.toLowerCase() === 'h') this.castSpell('heal');
            if (e.key.toLowerCase() === 's') this.castSpell('shield');
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    spawnEnemies() {
        for (let i = 0; i < 3 + this.level; i++) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 40),
                y: Math.random() * (this.canvas.height - 40),
                width: 30,
                height: 30,
                speed: 1 + Math.random() * 2,
                health: 50,
                type: Math.random() > 0.5 ? 'demon' : 'shadow',
                lastAttack: 0
            });
        }
    }
    
    spawnCrystals() {
        for (let i = 0; i < 5; i++) {
            this.crystalItems.push({
                x: Math.random() * (this.canvas.width - 20),
                y: Math.random() * (this.canvas.height - 20),
                width: 20,
                height: 20,
                collected: false,
                glow: 0
            });
        }
    }
    
    castSpell(type) {
        if (this.wizard.mana < 20) return;
        
        this.wizard.mana -= 20;
        
        switch(type) {
            case 'fireball':
                this.spells.push({
                    x: this.wizard.x + 20,
                    y: this.wizard.y + 20,
                    width: 15,
                    height: 15,
                    speed: 8,
                    type: 'fireball',
                    damage: 30,
                    direction: this.getTargetDirection()
                });
                break;
                
            case 'lightning':
                this.enemies.forEach(enemy => {
                    if (this.getDistance(this.wizard, enemy) < 150) {
                        enemy.health -= 40;
                        this.createParticles(enemy.x, enemy.y, '#ffff00');
                    }
                });
                break;
                
            case 'heal':
                this.wizard.health = Math.min(this.wizard.health + 30, 100);
                this.createParticles(this.wizard.x, this.wizard.y, '#00ff00');
                break;
                
            case 'shield':
                this.wizard.shield = true;
                setTimeout(() => this.wizard.shield = false, 3000);
                break;
        }
    }
    
    getTargetDirection() {
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const distance = this.getDistance(this.wizard, enemy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            const dx = nearestEnemy.x - this.wizard.x;
            const dy = nearestEnemy.y - this.wizard.y;
            const angle = Math.atan2(dy, dx);
            return { x: Math.cos(angle), y: Math.sin(angle) };
        }
        
        return { x: 1, y: 0 };
    }
    
    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: color
            });
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.handleInput();
        this.updateWizard();
        this.updateEnemies();
        this.updateSpells();
        this.updateParticles();
        this.updateCrystals();
        this.checkCollisions();
        this.updateHUD();
        
        // Regenerate mana
        if (this.wizard.mana < this.wizard.maxMana) {
            this.wizard.mana += 0.5;
        }
        
        // Check level completion
        if (this.enemies.length === 0) {
            this.nextLevel();
        }
    }
    
    handleInput() {
        if (this.keys['w'] || this.keys['arrowup']) {
            this.wizard.y = Math.max(0, this.wizard.y - this.wizard.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.wizard.y = Math.min(this.canvas.height - this.wizard.height, this.wizard.y + this.wizard.speed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.wizard.x = Math.max(0, this.wizard.x - this.wizard.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.wizard.x = Math.min(this.canvas.width - this.wizard.width, this.wizard.x + this.wizard.speed);
        }
    }
    
    updateWizard() {
        // Keep wizard on screen
        this.wizard.x = Math.max(0, Math.min(this.wizard.x, this.canvas.width - this.wizard.width));
        this.wizard.y = Math.max(0, Math.min(this.wizard.y, this.canvas.height - this.wizard.height));
    }
    
    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            // Move towards wizard
            const dx = this.wizard.x - enemy.x;
            const dy = this.wizard.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.enemies.splice(index, 1);
                this.score += 100;
                this.createParticles(enemy.x, enemy.y, '#ff0000');
            }
        });
    }
    
    updateSpells() {
        this.spells.forEach((spell, index) => {
            spell.x += spell.direction.x * spell.speed;
            spell.y += spell.direction.y * spell.speed;
            
            // Remove spells that go off screen
            if (spell.x < 0 || spell.x > this.canvas.width || 
                spell.y < 0 || spell.y > this.canvas.height) {
                this.spells.splice(index, 1);
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    updateCrystals() {
        this.crystalItems.forEach(crystal => {
            crystal.glow += 0.1;
        });
    }
    
    checkCollisions() {
        // Spell vs Enemy collisions
        this.spells.forEach((spell, spellIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(spell, enemy)) {
                    enemy.health -= spell.damage;
                    this.spells.splice(spellIndex, 1);
                    this.createParticles(enemy.x, enemy.y, '#ff6600');
                }
            });
        });
        
        // Wizard vs Enemy collisions
        this.enemies.forEach(enemy => {
            if (this.isColliding(this.wizard, enemy) && !this.wizard.shield) {
                this.wizard.health -= 1;
                if (this.wizard.health <= 0) {
                    this.endGame();
                }
            }
        });
        
        // Wizard vs Crystal collisions
        this.crystalItems.forEach((crystal, index) => {
            if (!crystal.collected && this.isColliding(this.wizard, crystal)) {
                crystal.collected = true;
                this.crystals++;
                this.score += 50;
                this.crystalItems.splice(index, 1);
                this.createParticles(crystal.x, crystal.y, '#00ffff');
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    nextLevel() {
        this.level++;
        this.spawnEnemies();
        this.spawnCrystals();
        this.wizard.mana = this.wizard.maxMana;
        this.score += this.level * 200;
    }
    
    updateHUD() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('mana').textContent = Math.floor(this.wizard.mana);
        document.getElementById('score').textContent = this.score;
        document.getElementById('crystals').textContent = this.crystals;
    }
    
    render() {
        // Clear canvas with magical background
        this.ctx.fillStyle = '#240046';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw magical background pattern
        this.ctx.fillStyle = 'rgba(157, 78, 221, 0.1)';
        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            this.ctx.arc(Math.random() * this.canvas.width, Math.random() * this.canvas.height, 
                        Math.random() * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw crystals
        this.crystalItems.forEach(crystal => {
            this.ctx.fillStyle = `hsl(180, 100%, ${50 + Math.sin(crystal.glow) * 20}%)`;
            this.ctx.fillRect(crystal.x, crystal.y, crystal.width, crystal.height);
            
            // Crystal glow
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(crystal.x + 5, crystal.y + 5, crystal.width - 10, crystal.height - 10);
            this.ctx.shadowBlur = 0;
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.type === 'demon' ? '#ff0000' : '#800080';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy eyes
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            this.ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
            
            // Health bar
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 4);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x, enemy.y - 10, (enemy.width * enemy.health) / 50, 4);
        });
        
        // Draw spells
        this.spells.forEach(spell => {
            if (spell.type === 'fireball') {
                this.ctx.fillStyle = '#ff6600';
                this.ctx.beginPath();
                this.ctx.arc(spell.x, spell.y, spell.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Fireball trail
                this.ctx.fillStyle = '#ff0000';
                this.ctx.beginPath();
                this.ctx.arc(spell.x - 5, spell.y, spell.width / 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
            this.ctx.globalAlpha = 1;
        });
        
        // Draw wizard
        this.ctx.fillStyle = this.wizard.shield ? '#00ffff' : '#9d4edd';
        this.ctx.fillRect(this.wizard.x, this.wizard.y, this.wizard.width, this.wizard.height);
        
        // Wizard hat
        this.ctx.fillStyle = '#4a0e4e';
        this.ctx.beginPath();
        this.ctx.moveTo(this.wizard.x + 20, this.wizard.y);
        this.ctx.lineTo(this.wizard.x + 10, this.wizard.y - 15);
        this.ctx.lineTo(this.wizard.x + 30, this.wizard.y - 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Wizard staff
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.wizard.x + 35, this.wizard.y + 10);
        this.ctx.lineTo(this.wizard.x + 50, this.wizard.y - 10);
        this.ctx.stroke();
        
        // Staff orb
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(this.wizard.x + 50, this.wizard.y - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Health bar
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.wizard.x, this.wizard.y + this.wizard.height + 5, this.wizard.width, 4);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.wizard.x, this.wizard.y + this.wizard.height + 5, 
                         (this.wizard.width * this.wizard.health) / 100, 4);
        
        // Shield effect
        if (this.wizard.shield) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.wizard.x + 20, this.wizard.y + 20, 30, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCrystals').textContent = this.crystals;
        
        document.getElementById('gameOver').style.display = 'block';
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Global functions
let game;

window.addEventListener('load', () => {
    game = new MagicRealm();
});

function castSpell(type) {
    if (game) {
        game.castSpell(type);
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    game = new MagicRealm();
}