class SoccerProGame {
    constructor() {
        this.score = 0;
        this.goals = 0;
        this.level = 1;
        this.gameTime = 0;
        this.isPlaying = false;
        this.gameTimer = null;
        
        this.player = document.getElementById('player');
        this.ball = document.getElementById('ball');
        this.field = document.querySelector('.soccer-field');
        
        this.playerPos = { x: 20, y: 50 };
        this.ballPos = { x: 50, y: 50 };
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.resetPositions();
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('moveUp').addEventListener('click', () => this.movePlayer(0, -10));
        document.getElementById('moveDown').addEventListener('click', () => this.movePlayer(0, 10));
        document.getElementById('moveLeft').addEventListener('click', () => this.movePlayer(-10, 0));
        document.getElementById('moveRight').addEventListener('click', () => this.movePlayer(10, 0));
        document.getElementById('kick').addEventListener('click', () => this.kickBall());
        
        // Game control buttons
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('pauseGame').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (!this.isPlaying) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.movePlayer(0, -10);
                break;
            case 'ArrowDown':
            case 's':
                this.movePlayer(0, 10);
                break;
            case 'ArrowLeft':
            case 'a':
                this.movePlayer(-10, 0);
                break;
            case 'ArrowRight':
            case 'd':
                this.movePlayer(10, 0);
                break;
            case ' ':
                e.preventDefault();
                this.kickBall();
                break;
        }
    }
    
    movePlayer(deltaX, deltaY) {
        if (!this.isPlaying) return;
        
        this.playerPos.x = Math.max(5, Math.min(95, this.playerPos.x + deltaX));
        this.playerPos.y = Math.max(10, Math.min(90, this.playerPos.y + deltaY));
        
        this.player.style.left = this.playerPos.x + '%';
        this.player.style.top = this.playerPos.y + '%';
        
        // Check if player is near ball
        if (this.isNearBall()) {
            this.moveBallWithPlayer(deltaX, deltaY);
        }
    }
    
    isNearBall() {
        const distance = Math.sqrt(
            Math.pow(this.playerPos.x - this.ballPos.x, 2) + 
            Math.pow(this.playerPos.y - this.ballPos.y, 2)
        );
        return distance < 8;
    }
    
    moveBallWithPlayer(deltaX, deltaY) {
        this.ballPos.x = Math.max(5, Math.min(95, this.ballPos.x + deltaX * 0.8));
        this.ballPos.y = Math.max(10, Math.min(90, this.ballPos.y + deltaY * 0.8));
        
        this.ball.style.left = this.ballPos.x + '%';
        this.ball.style.top = this.ballPos.y + '%';
    }
    
    kickBall() {
        if (!this.isPlaying || !this.isNearBall()) return;
        
        // Calculate kick direction towards goal
        const goalX = 95;
        const goalY = 50;
        
        const directionX = goalX - this.ballPos.x;
        const directionY = goalY - this.ballPos.y;
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        
        const normalizedX = directionX / distance;
        const normalizedY = directionY / distance;
        
        // Animate ball movement
        this.animateBallKick(normalizedX * 30, normalizedY * 30);
    }
    
    animateBallKick(deltaX, deltaY) {
        const startX = this.ballPos.x;
        const startY = this.ballPos.y;
        const targetX = Math.max(5, Math.min(95, startX + deltaX));
        const targetY = Math.max(10, Math.min(90, startY + deltaY));
        
        let progress = 0;
        const duration = 500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            
            this.ballPos.x = startX + (targetX - startX) * progress;
            this.ballPos.y = startY + (targetY - startY) * progress;
            
            this.ball.style.left = this.ballPos.x + '%';
            this.ball.style.top = this.ballPos.y + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.checkGoal();
            }
        };
        
        animate();
    }
    
    checkGoal() {
        // Check if ball is in goal area (right side)
        if (this.ballPos.x > 90 && this.ballPos.y > 35 && this.ballPos.y < 65) {
            this.scoreGoal();
        }
    }
    
    scoreGoal() {
        this.goals++;
        this.score += 100 * this.level;
        this.updateDisplay();
        
        // Reset ball position
        setTimeout(() => {
            this.ballPos = { x: 50, y: 50 };
            this.ball.style.left = '50%';
            this.ball.style.top = '50%';
        }, 1000);
        
        // Level up every 3 goals
        if (this.goals % 3 === 0) {
            this.level++;
            this.updateDisplay();
        }
    }
    
    startGame() {
        this.isPlaying = true;
        document.getElementById('startGame').disabled = true;
        document.getElementById('pauseGame').disabled = false;
        
        this.gameTimer = setInterval(() => {
            this.gameTime++;
            this.updateTimer();
            this.moveOpponents();
        }, 1000);
    }
    
    pauseGame() {
        this.isPlaying = false;
        document.getElementById('startGame').disabled = false;
        document.getElementById('pauseGame').disabled = true;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    resetGame() {
        this.pauseGame();
        this.score = 0;
        this.goals = 0;
        this.level = 1;
        this.gameTime = 0;
        this.resetPositions();
        this.updateDisplay();
        this.updateTimer();
        
        document.getElementById('startGame').disabled = false;
        document.getElementById('pauseGame').disabled = true;
    }
    
    resetPositions() {
        this.playerPos = { x: 20, y: 50 };
        this.ballPos = { x: 50, y: 50 };
        
        this.player.style.left = '20%';
        this.player.style.top = '50%';
        this.ball.style.left = '50%';
        this.ball.style.top = '50%';
    }
    
    moveOpponents() {
        const opponents = document.querySelectorAll('.opponent');
        opponents.forEach((opponent, index) => {
            const currentTop = parseFloat(opponent.style.top) || (index === 0 ? 30 : 70);
            const newTop = currentTop + (Math.random() - 0.5) * 20;
            const clampedTop = Math.max(15, Math.min(85, newTop));
            opponent.style.top = clampedTop + '%';
        });
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('goals').textContent = this.goals;
        document.getElementById('level').textContent = this.level;
    }
    
    updateTimer() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        document.getElementById('timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SoccerProGame();
});