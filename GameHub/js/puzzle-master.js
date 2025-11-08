// Puzzle Master Game Logic
let gameState = {
    level: 1,
    score: 0,
    streak: 0,
    currentPuzzle: null,
    startTime: null,
    timerInterval: null
};

let puzzles = {
    sliding: {
        grid: [],
        size: 3,
        emptyPos: { x: 2, y: 2 }
    },
    math: {
        equation: '',
        answer: 0,
        userAnswer: ''
    },
    memory: {
        sequence: [],
        userSequence: [],
        showingSequence: false
    },
    pattern: {
        pattern: [],
        missing: 0
    }
};

function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    if (!gameState.startTime) return;
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateStats() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('streak').textContent = gameState.streak;
}

function startPuzzle(type) {
    gameState.currentPuzzle = type;
    startTimer();
    
    switch(type) {
        case 'sliding':
            createSlidingPuzzle();
            break;
        case 'math':
            createMathPuzzle();
            break;
        case 'memory':
            createMemoryPuzzle();
            break;
        case 'pattern':
            createPatternPuzzle();
            break;
    }
}

function createSlidingPuzzle() {
    const size = Math.min(3 + Math.floor(gameState.level / 3), 5);
    puzzles.sliding.size = size;
    
    // Create solved grid
    puzzles.sliding.grid = [];
    for (let i = 0; i < size; i++) {
        puzzles.sliding.grid[i] = [];
        for (let j = 0; j < size; j++) {
            puzzles.sliding.grid[i][j] = i * size + j + 1;
        }
    }
    puzzles.sliding.grid[size-1][size-1] = 0; // Empty space
    puzzles.sliding.emptyPos = { x: size-1, y: size-1 };
    
    // Shuffle
    for (let i = 0; i < 1000; i++) {
        const moves = getValidMoves();
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        moveTile(randomMove.x, randomMove.y, false);
    }
    
    renderSlidingPuzzle();
}

function getValidMoves() {
    const moves = [];
    const { x, y } = puzzles.sliding.emptyPos;
    const size = puzzles.sliding.size;
    
    if (x > 0) moves.push({ x: x-1, y });
    if (x < size-1) moves.push({ x: x+1, y });
    if (y > 0) moves.push({ x, y: y-1 });
    if (y < size-1) moves.push({ x, y: y+1 });
    
    return moves;
}

function moveTile(x, y, checkWin = true) {
    const { x: emptyX, y: emptyY } = puzzles.sliding.emptyPos;
    
    if (Math.abs(x - emptyX) + Math.abs(y - emptyY) !== 1) return false;
    
    puzzles.sliding.grid[emptyY][emptyX] = puzzles.sliding.grid[y][x];
    puzzles.sliding.grid[y][x] = 0;
    puzzles.sliding.emptyPos = { x, y };
    
    if (checkWin) {
        renderSlidingPuzzle();
        if (checkSlidingWin()) {
            completePuzzle();
        }
    }
    
    return true;
}

function renderSlidingPuzzle() {
    const size = puzzles.sliding.size;
    const puzzleArea = document.getElementById('puzzleArea');
    
    puzzleArea.innerHTML = `
        <h2>🔢 Sliding Puzzle - Level ${gameState.level}</h2>
        <p>Arrange numbers from 1 to ${size*size-1} in order</p>
        <div class="puzzle-grid grid-${size}x${size}" id="slidingGrid"></div>
        <button class="btn" onclick="createSlidingPuzzle()">🔄 Shuffle</button>
        <button class="btn" onclick="showPuzzleMenu()">🏠 Menu</button>
    `;
    
    const grid = document.getElementById('slidingGrid');
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.className = 'puzzle-cell';
            cell.style.height = `${80 - size * 5}px`;
            
            if (puzzles.sliding.grid[i][j] === 0) {
                cell.className += ' empty';
            } else {
                cell.textContent = puzzles.sliding.grid[i][j];
                cell.onclick = () => moveTile(j, i);
            }
            
            grid.appendChild(cell);
        }
    }
}

function checkSlidingWin() {
    const size = puzzles.sliding.size;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const expected = i * size + j + 1;
            if (i === size-1 && j === size-1) {
                if (puzzles.sliding.grid[i][j] !== 0) return false;
            } else {
                if (puzzles.sliding.grid[i][j] !== expected) return false;
            }
        }
    }
    return true;
}

function createMathPuzzle() {
    const difficulty = Math.min(gameState.level, 10);
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a, b, answer;
    
    switch(op) {
        case '+':
            a = Math.floor(Math.random() * (10 * difficulty)) + 1;
            b = Math.floor(Math.random() * (10 * difficulty)) + 1;
            answer = a + b;
            break;
        case '-':
            a = Math.floor(Math.random() * (10 * difficulty)) + 10;
            b = Math.floor(Math.random() * a) + 1;
            answer = a - b;
            break;
        case '*':
            a = Math.floor(Math.random() * (5 + difficulty)) + 1;
            b = Math.floor(Math.random() * (5 + difficulty)) + 1;
            answer = a * b;
            break;
    }
    
    puzzles.math.equation = `${a} ${op} ${b}`;
    puzzles.math.answer = answer;
    
    renderMathPuzzle();
}

function renderMathPuzzle() {
    const puzzleArea = document.getElementById('puzzleArea');
    
    puzzleArea.innerHTML = `
        <h2>➕ Math Challenge - Level ${gameState.level}</h2>
        <p>Solve the equation quickly!</p>
        <div style="font-size: 36px; margin: 30px 0;">
            ${puzzles.math.equation} = ?
        </div>
        <input type="number" class="math-input" id="mathAnswer" placeholder="Answer" onkeypress="checkMathEnter(event)">
        <br>
        <button class="btn btn-success" onclick="checkMathAnswer()">✓ Submit</button>
        <button class="btn" onclick="createMathPuzzle()">🔄 New Problem</button>
        <button class="btn" onclick="showPuzzleMenu()">🏠 Menu</button>
    `;
    
    document.getElementById('mathAnswer').focus();
}

function checkMathEnter(event) {
    if (event.key === 'Enter') {
        checkMathAnswer();
    }
}

function checkMathAnswer() {
    const userAnswer = parseInt(document.getElementById('mathAnswer').value);
    
    if (userAnswer === puzzles.math.answer) {
        completePuzzle();
    } else {
        gameState.streak = 0;
        updateStats();
        alert('❌ Incorrect! Try again.');
        createMathPuzzle();
    }
}

function createMemoryPuzzle() {
    const length = Math.min(3 + Math.floor(gameState.level / 2), 8);
    puzzles.memory.sequence = [];
    puzzles.memory.userSequence = [];
    
    for (let i = 0; i < length; i++) {
        puzzles.memory.sequence.push(Math.floor(Math.random() * 9) + 1);
    }
    
    renderMemoryPuzzle();
    showSequence();
}

function renderMemoryPuzzle() {
    const puzzleArea = document.getElementById('puzzleArea');
    
    puzzleArea.innerHTML = `
        <h2>🧠 Memory Game - Level ${gameState.level}</h2>
        <p>Remember the sequence and repeat it!</p>
        <div class="sequence-display" id="sequenceDisplay"></div>
        <div class="puzzle-grid grid-3x3" id="memoryGrid" style="margin-top: 30px;"></div>
        <button class="btn" onclick="createMemoryPuzzle()">🔄 New Sequence</button>
        <button class="btn" onclick="showPuzzleMenu()">🏠 Menu</button>
    `;
    
    const grid = document.getElementById('memoryGrid');
    for (let i = 1; i <= 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'puzzle-cell';
        cell.style.height = '80px';
        cell.textContent = i;
        cell.onclick = () => addToUserSequence(i);
        grid.appendChild(cell);
    }
}

function showSequence() {
    puzzles.memory.showingSequence = true;
    const display = document.getElementById('sequenceDisplay');
    
    puzzles.memory.sequence.forEach((num, index) => {
        setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'sequence-item';
            item.textContent = num;
            display.appendChild(item);
            
            if (index === puzzles.memory.sequence.length - 1) {
                setTimeout(() => {
                    display.innerHTML = '<p>Now repeat the sequence by clicking the numbers!</p>';
                    puzzles.memory.showingSequence = false;
                }, 1000);
            }
        }, index * 800);
    });
}

function addToUserSequence(num) {
    if (puzzles.memory.showingSequence) return;
    
    puzzles.memory.userSequence.push(num);
    
    if (puzzles.memory.userSequence.length === puzzles.memory.sequence.length) {
        checkMemorySequence();
    }
}

function checkMemorySequence() {
    const correct = puzzles.memory.sequence.every((num, index) => 
        num === puzzles.memory.userSequence[index]
    );
    
    if (correct) {
        completePuzzle();
    } else {
        gameState.streak = 0;
        updateStats();
        alert('❌ Wrong sequence! Try again.');
        createMemoryPuzzle();
    }
}

function createPatternPuzzle() {
    const patterns = [
        [1, 2, 4, 8, 16], // Powers of 2
        [2, 4, 6, 8, 10], // Even numbers
        [1, 4, 9, 16, 25], // Squares
        [1, 1, 2, 3, 5], // Fibonacci
        [3, 6, 9, 12, 15] // Multiples of 3
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const missing = Math.floor(Math.random() * (pattern.length - 1)) + 1;
    
    puzzles.pattern.pattern = [...pattern];
    puzzles.pattern.missing = missing;
    puzzles.pattern.answer = pattern[missing];
    puzzles.pattern.pattern[missing] = '?';
    
    renderPatternPuzzle();
}

function renderPatternPuzzle() {
    const puzzleArea = document.getElementById('puzzleArea');
    
    puzzleArea.innerHTML = `
        <h2>🎨 Pattern Match - Level ${gameState.level}</h2>
        <p>Find the missing number in the pattern!</p>
        <div class="sequence-display">
            ${puzzles.pattern.pattern.map(num => 
                `<div class="sequence-item">${num}</div>`
            ).join('')}
        </div>
        <input type="number" class="math-input" id="patternAnswer" placeholder="Missing number" onkeypress="checkPatternEnter(event)">
        <br>
        <button class="btn btn-success" onclick="checkPatternAnswer()">✓ Submit</button>
        <button class="btn" onclick="createPatternPuzzle()">🔄 New Pattern</button>
        <button class="btn" onclick="showPuzzleMenu()">🏠 Menu</button>
    `;
    
    document.getElementById('patternAnswer').focus();
}

function checkPatternEnter(event) {
    if (event.key === 'Enter') {
        checkPatternAnswer();
    }
}

function checkPatternAnswer() {
    const userAnswer = parseInt(document.getElementById('patternAnswer').value);
    
    if (userAnswer === puzzles.pattern.answer) {
        completePuzzle();
    } else {
        gameState.streak = 0;
        updateStats();
        alert('❌ Incorrect! Look for the pattern.');
        createPatternPuzzle();
    }
}

function completePuzzle() {
    stopTimer();
    const timeBonus = Math.max(0, 60 - Math.floor((Date.now() - gameState.startTime) / 1000));
    const baseScore = gameState.level * 100;
    const streakBonus = gameState.streak * 50;
    
    gameState.score += baseScore + timeBonus * 10 + streakBonus;
    gameState.streak++;
    gameState.level++;
    
    updateStats();
    
    alert(`🎉 Puzzle Complete!\nBase Score: ${baseScore}\nTime Bonus: ${timeBonus * 10}\nStreak Bonus: ${streakBonus}\nTotal Added: ${baseScore + timeBonus * 10 + streakBonus}`);
    
    showPuzzleMenu();
}

function showPuzzleMenu() {
    stopTimer();
    gameState.currentPuzzle = null;
    
    const puzzleArea = document.getElementById('puzzleArea');
    puzzleArea.innerHTML = `
        <h2>Choose Your Next Challenge</h2>
        <div class="puzzle-selector">
            <div class="puzzle-type" onclick="startPuzzle('sliding')">
                <h3>🔢 Sliding Puzzle</h3>
                <p>Arrange numbers in order</p>
            </div>
            <div class="puzzle-type" onclick="startPuzzle('math')">
                <h3>➕ Math Challenge</h3>
                <p>Solve equations quickly</p>
            </div>
            <div class="puzzle-type" onclick="startPuzzle('memory')">
                <h3>🧠 Memory Game</h3>
                <p>Remember the sequence</p>
            </div>
            <div class="puzzle-type" onclick="startPuzzle('pattern')">
                <h3>🎨 Pattern Match</h3>
                <p>Complete the pattern</p>
            </div>
        </div>
    `;
}

// Initialize game
updateStats();