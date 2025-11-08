// Adventure Quest Game Logic
let player = {
    health: 100,
    maxHealth: 100,
    attack: 10,
    defense: 5,
    mana: 50,
    maxMana: 50,
    score: 0,
    gold: 0,
    inventory: [],
    class: null
};

const classes = {
    warrior: { health: 120, attack: 15, defense: 8, mana: 30, name: "⚔️ Warrior" },
    mage: { health: 80, attack: 8, defense: 3, mana: 100, name: "🧙 Mage" },
    rogue: { health: 90, attack: 12, defense: 6, mana: 60, name: "🗡️ Rogue" }
};

const items = {
    healthPotion: { name: "Health Potion", effect: "heal", value: 30 },
    manaPotion: { name: "Mana Potion", effect: "mana", value: 25 },
    ironSword: { name: "Iron Sword", effect: "attack", value: 5 },
    magicShield: { name: "Magic Shield", effect: "defense", value: 3 },
    dragonGem: { name: "Dragon Gem", effect: "score", value: 500 }
};

const scenarios = {
    start: {
        text: "Welcome, brave adventurer! Choose your class before entering the mysterious dungeon. Each class has unique abilities and stats.",
        choices: [
            { text: "⚔️ Warrior (High HP & Attack)", action: "selectWarrior" },
            { text: "🧙 Mage (High Mana & Magic)", action: "selectMage" },
            { text: "🗡️ Rogue (Balanced & Agile)", action: "selectRogue" }
        ]
    },
    selectWarrior: {
        text: "You are now a mighty Warrior! Your strength and endurance will serve you well in combat. You stand before the dungeon entrance.",
        choices: [
            { text: "Enter the dungeon", action: "enter" },
            { text: "Change class", action: "start" }
        ],
        effect: () => selectClass('warrior')
    },
    selectMage: {
        text: "You are now a wise Mage! Your magical powers and knowledge will guide you through challenges. You stand before the dungeon entrance.",
        choices: [
            { text: "Enter the dungeon", action: "enter" },
            { text: "Change class", action: "start" }
        ],
        effect: () => selectClass('mage')
    },
    selectRogue: {
        text: "You are now a cunning Rogue! Your agility and stealth will help you avoid danger and find hidden treasures. You stand before the dungeon entrance.",
        choices: [
            { text: "Enter the dungeon", action: "enter" },
            { text: "Change class", action: "start" }
        ],
        effect: () => selectClass('rogue')
    },
    enter: {
        text: "You step into the dark dungeon. The air is cold and musty. You see two paths ahead.",
        choices: [
            { text: "Take the left path (looks safer)", action: "leftPath" },
            { text: "Take the right path (you hear treasure jingling)", action: "rightPath" }
        ]
    },
    leave: {
        text: "You decide discretion is the better part of valor and walk away. Sometimes the wisest choice is not to fight.",
        choices: [
            { text: "Start over", action: "start" }
        ]
    },
    leftPath: {
        text: "You find a treasure room with multiple items! A healing potion glows on a pedestal, and you spot a mana potion and an iron sword.",
        choices: [
            { text: "Take healing potion", action: "takeHealthPotion" },
            { text: "Take mana potion", action: "takeManaPotion" },
            { text: "Take iron sword", action: "takeIronSword" }
        ]
    },
    takeHealthPotion: {
        text: "You take the healing potion and feel immediately refreshed! Your wounds heal.",
        choices: [
            { text: "Continue deeper", action: "goblin" }
        ],
        effect: () => { addItem('healthPotion'); useItem('healthPotion'); player.score += 50; }
    },
    takeManaPotion: {
        text: "You take the mana potion and feel magical energy coursing through you!",
        choices: [
            { text: "Continue deeper", action: "goblin" }
        ],
        effect: () => { addItem('manaPotion'); useItem('manaPotion'); player.score += 50; }
    },
    takeIronSword: {
        text: "You take the iron sword. It feels perfectly balanced in your hands, increasing your attack power!",
        choices: [
            { text: "Continue deeper", action: "goblin" }
        ],
        effect: () => { addItem('ironSword'); useItem('ironSword'); player.score += 75; }
    },
    rightPath: {
        text: "You find a chest of gold! But as you approach, a trap activates and spikes shoot from the walls!",
        choices: [
            { text: "Dodge and grab the gold", action: "trapDodge" },
            { text: "Retreat carefully", action: "goblin" }
        ]
    },
    trapDodge: {
        text: "You barely dodge the spikes but manage to grab gold and a magic shield! You're wounded but well-equipped.",
        choices: [
            { text: "Continue exploring", action: "goblin" }
        ],
        effect: () => { 
            const damage = Math.max(1, 20 - player.defense);
            player.health -= damage;
            player.gold += 50;
            addItem('magicShield');
            useItem('magicShield');
            player.score += 100;
        }
    },
    goblin: {
        text: "A fierce goblin blocks your path! It snarls and raises its rusty sword. What do you do?",
        choices: [
            { text: "Fight the goblin", action: "fightGoblin" },
            { text: "Try to sneak past", action: "sneak" }
        ]
    },
    fightGoblin: {
        text: `You engage in combat! The goblin attacks with ${15 - player.defense} damage, but you fight back valiantly.`,
        choices: [
            { text: "⚔️ Sword Attack", action: "swordAttack" },
            { text: "🛡️ Defensive Strike", action: "defensiveStrike" },
            player.class === 'mage' && player.mana >= 20 ? { text: "🔥 Fireball (20 mana)", action: "fireball" } : null,
            player.class === 'rogue' && player.mana >= 15 ? { text: "🗡️ Sneak Attack (15 mana)", action: "sneakAttack" } : null
        ].filter(Boolean),
        effect: () => {
            const damage = Math.max(1, 15 - player.defense);
            player.health -= damage;
        }
    },
    swordAttack: {
        text: "You strike with your weapon! The goblin staggers and falls defeated.",
        choices: [{ text: "Search the goblin", action: "searchGoblin" }],
        effect: () => { player.score += 150; }
    },
    defensiveStrike: {
        text: "You block the goblin's attack and counter! Your defensive approach pays off.",
        choices: [{ text: "Search the goblin", action: "searchGoblin" }],
        effect: () => { player.health += 5; player.score += 120; }
    },
    fireball: {
        text: "You cast a powerful fireball! The goblin is incinerated instantly. Magic is truly powerful!",
        choices: [{ text: "Search the remains", action: "searchGoblin" }],
        effect: () => { player.mana -= 20; player.score += 200; }
    },
    sneakAttack: {
        text: "You strike from the shadows! A critical hit that defeats the goblin in one blow.",
        choices: [{ text: "Search the goblin", action: "searchGoblin" }],
        effect: () => { player.mana -= 15; player.score += 180; }
    },
    searchGoblin: {
        text: "You find gold coins and a dragon gem on the defeated goblin!",
        choices: [{ text: "Proceed to final chamber", action: "dragon" }],
        effect: () => { player.gold += 25; addItem('dragonGem'); }
    },
    sneak: {
        text: "You successfully sneak past the sleeping goblin! You notice it was guarding a magic sword.",
        choices: [
            { text: "Take the magic sword", action: "magicSword" },
            { text: "Leave it and continue", action: "dragon" }
        ]
    },
    magicSword: {
        text: "You carefully take the enchanted blade. It pulses with magical energy, greatly enhancing your combat abilities!",
        choices: [
            { text: "Continue to the final chamber", action: "dragon" }
        ],
        effect: () => { 
            player.attack += 10;
            player.mana += 20;
            player.maxMana += 20;
            player.score += 200;
            addItem('enchantedBlade');
        }
    },
    winFight: {
        text: "You defeat the goblin! It drops a small pouch of coins before disappearing.",
        choices: [
            { text: "Proceed to the final chamber", action: "dragon" }
        ]
    },
    dragon: {
        text: "You enter a vast chamber where a mighty dragon sleeps on a pile of treasure! This is your final challenge.",
        choices: [
            { text: "Fight the dragon", action: "fightDragon" },
            { text: "Try to steal treasure quietly", action: "stealTreasure" }
        ]
    },
    fightDragon: {
        text: getDragonFightResult(),
        choices: [
            { text: "Claim your victory!", action: "victory" },
            { text: "Play again", action: "start" }
        ],
        effect: () => {
            const totalPower = player.attack + player.defense + (player.mana / 10);
            if (totalPower >= 25) {
                player.score += 1000;
                player.gold += 200;
                addItem('dragonCrown');
            } else {
                player.health = 0;
            }
        }
    },
    victory: {
        text: `Congratulations, ${player.class}! You have conquered the dungeon and become a legend! Your final score: ${player.score} points with ${player.gold} gold pieces.`,
        choices: [
            { text: "Play again as different class", action: "start" }
        ]
    },
    stealTreasure: {
        text: "You carefully sneak around the dragon and grab some treasure. The dragon stirs but doesn't wake. You escape with your loot!",
        choices: [
            { text: "Play again", action: "start" }
        ],
        effect: () => { player.score += 500; }
    }
};

function selectClass(className) {
    const classStats = classes[className];
    player.class = className;
    player.health = classStats.health;
    player.maxHealth = classStats.health;
    player.attack = classStats.attack;
    player.defense = classStats.defense;
    player.mana = classStats.mana;
    player.maxMana = classStats.mana;
}

function addItem(itemKey) {
    const item = items[itemKey];
    if (item) {
        player.inventory.push(item);
        updateInventoryDisplay();
    }
}

function useItem(itemKey) {
    const item = items[itemKey];
    if (!item) return;
    
    switch(item.effect) {
        case 'heal':
            player.health = Math.min(player.maxHealth, player.health + item.value);
            break;
        case 'mana':
            player.mana = Math.min(player.maxMana, player.mana + item.value);
            break;
        case 'attack':
            player.attack += item.value;
            break;
        case 'defense':
            player.defense += item.value;
            break;
        case 'score':
            player.score += item.value;
            break;
    }
}

function updateInventoryDisplay() {
    const inventoryDiv = document.getElementById('inventory');
    if (player.inventory.length === 0) {
        inventoryDiv.textContent = 'Empty';
    } else {
        inventoryDiv.innerHTML = player.inventory.map(item => `<span style="margin: 2px; padding: 4px; background: rgba(255,255,255,0.2); border-radius: 3px; font-size: 12px;">${item.name}</span>`).join(' ');
    }
}

function getDragonFightResult() {
    const totalPower = player.attack + player.defense + (player.mana / 10);
    if (totalPower >= 25) {
        return `With your combined might (Attack: ${player.attack}, Defense: ${player.defense}, Mana: ${player.mana}), you defeat the mighty dragon! The beast falls and you claim the ultimate treasure!`;
    } else {
        return `Despite your brave efforts (Attack: ${player.attack}, Defense: ${player.defense}, Mana: ${player.mana}), the dragon proves too powerful. You need more strength to face such a legendary foe.`;
    }
}

function updateDisplay() {
    document.getElementById('health').textContent = `${player.health}/${player.maxHealth}`;
    document.getElementById('attack').textContent = player.attack;
    document.getElementById('defense').textContent = player.defense;
    document.getElementById('mana').textContent = `${player.mana}/${player.maxMana}`;
    document.getElementById('score').textContent = player.score;
    document.getElementById('gold').textContent = player.gold;
    
    const gameScreen = document.getElementById('gameScreen');
    if (player.health <= 0) {
        gameScreen.className = 'game-screen game-over';
    } else if (player.score >= 1000) {
        gameScreen.className = 'game-screen victory';
    } else {
        gameScreen.className = 'game-screen';
    }
}

function showScenario(scenarioKey) {
    const scenario = scenarios[scenarioKey];
    if (!scenario) return;
    
    // Apply effects if any
    if (scenario.effect) {
        scenario.effect();
    }
    
    // Update story text
    document.getElementById('storyText').textContent = scenario.text;
    
    // Update choices
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    scenario.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(choice.action);
        choicesDiv.appendChild(button);
    });
    
    updateDisplay();
}

function makeChoice(action) {
    if (player.health <= 0) {
        resetGame();
        return;
    }
    
    showScenario(action);
}

function resetGame() {
    player = {
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        mana: 50,
        maxMana: 50,
        score: 0,
        gold: 0,
        inventory: [],
        class: null
    };
    updateInventoryDisplay();
    showScenario('start');
}

function goBack() {
    window.location.href = 'index.html';
}

// Initialize game
showScenario('start');